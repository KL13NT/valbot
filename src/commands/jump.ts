import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Jump extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "jump",
			category: "Music",
			cooldown: 15 * 1000,
			nOfParams: 1,
			description: "Jump to a specific song in queue.",
			exampleUsage: "jump 1",
			extraParams: false,
			optionalParams: 0,
			aliases: ["j"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message, params }: CommandContext) => {
		try {
			const voiceChannel = member.voice.channel;
			const textChannel = message.channel as TextChannel;
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			if (this.client.voice.connections.size === 0) {
				await reply("Bot.VoiceNotConnected", message.channel);
				return;
			}

			if (!voiceChannel) {
				await reply("User.VoiceNotConnected", textChannel);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("User.SameChannel", textChannel);
				return;
			}

			const id = Number(params[0]);

			if (this.isInvalidId(id)) {
				await reply("Command.Jump.Invalid", textChannel);
				return;
			}

			const queueLength = controller.queue.length;

			if (queueLength === 0) {
				await reply("Music.EmptyQueue", textChannel);
				return;
			}

			if (id - 1 > queueLength) {
				await reply("Command.Jump.OutOfBoundaries", textChannel);
				return;
			}

			const song = controller.queue[id - 1];

			await reply("Command.Jump", textChannel, {
				id,
				title: song.title,
				url: song.url,
			});

			await controller.jump(id);
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	isInvalidId = (id: number) => {
		return isNaN(id) || id <= 0;
	};
}
