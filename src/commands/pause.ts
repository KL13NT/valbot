import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { createEmbed } from "../utils/embed";

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
			await message.reply(
				createEmbed({
					description: "Bot is not in a voice channel.",
				}),
			);

			return;
		}

		if (!voiceChannel) {
			await message.reply(
				createEmbed({
					description: `You're not connected to a voice channel`,
				}),
			);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await message.reply(
				createEmbed({
					description: "You must be in the same channel as the bot",
				}),
			);
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await message.reply(
				createEmbed({
					description: "No song is playing",
				}),
			);
			return;
		}

		if (controller.playState === "paused") {
			await message.reply(
				createEmbed({
					description: "Already Paused ⏸️",
				}),
			);
			return;
		}

		await message.reply(
			createEmbed({
				description: "Paused ⏸️",
			}),
		);

		await controller.pause();
	};
}
