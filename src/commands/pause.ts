import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
export default class Pause extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "pause",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "وقف الاغنية دي",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (this.client.voice.connections.size === 0) {
			await reply("Bot.VoiceNotConnected", message.channel, {});
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", message.channel, {});
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", message.channel, {});
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Command.NowPlaying.NoSong", message.channel, {});
			return;
		}

		if (controller.playState === "paused") {
			await reply("Command.Pause.AlreadyPaused", message.channel, {});
			return;
		}

		await reply("Command.Pause.Paused", message.channel, {});

		await controller.pause();
	};
}
