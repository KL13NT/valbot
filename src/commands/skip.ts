import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Skip extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "skip",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "عجلة قدام ياسطا",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			aliases: ["s"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;
			const voiceChannel = member.voice.channel;

			if (!voiceChannel) {
				await reply("User.VoiceNotConnected", message.channel, {});
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("User.SameChannel", message.channel, {});
				return;
			}

			if (this.client.voice.connections.size === 0) {
				await reply("Bot.VoiceNotConnected", message.channel, {});
				return;
			}

			const song = controller.getCurrentSong();

			const response = song
				? {
						message: "Command.Skip.Skipped",
						params: {
							title: song.title,
							url: song.url,
						},
				  }
				: {
						message: "Music.EmptyQueue",
						params: {},
				  };

			await reply(response.message, message.channel, response.params);

			await controller.skip(true);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
