import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import ValClient from "../ValClient";

export default class PreviousNow extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "previousNow",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "Jump to the previous track",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			aliases: ["prev", "prevNow"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
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

			const queueLength = controller.queue.length;

			if (queueLength === 0) {
				await reply("Music.EmptyQueue", textChannel);
				return;
			}

			const index = controller.currentSongIndex;

			if (index === 0 && controller.loopState !== "queue") {
				await reply("Command.PreviousNow.NoPreviousSong", textChannel);
				return;
			}

			if (index === 0 && controller.loopState === "queue") {
				const lastSongInTheQueueIndex = queueLength - 1;
				const { title, url } = controller.queue[lastSongInTheQueueIndex];

				await reply("Command.PreviousNow.jumped", textChannel, {
					id: lastSongInTheQueueIndex + 1,
					title,
					url,
				});

				await controller.jump(lastSongInTheQueueIndex);

				return;
			}

			const { title, url } = controller.queue[index - 1];

			await reply("Command.PreviousNow.jumped", textChannel, {
				id: index,
				title,
				url,
			});

			await controller.jump(index - 1);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
