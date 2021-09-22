import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { createEmbed } from "../utils/embed";
import { log, reply } from "../utils/general";
import ValClient from "../ValClient";

export default class ClearQueue extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "cq",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "فضي يابني الليستة دي",
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
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;
			const voiceChannel = member.voice.channel;

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

			if (this.client.voice.connections.size === 0) {
				await message.reply(
					createEmbed({
						description: "Bot is not in a voice channel.",
					}),
				);
			}

			if (controller.queue.length === 0) {
				await reply("Command.ClearQueue.AlreadyEmpty", message.channel);
				return;
			}

			await message.reply(
				createEmbed({
					description: "Queue cleared.",
				}),
			);

			await controller.clear();
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
