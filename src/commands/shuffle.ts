import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { log, reply } from "../utils/general";
import { TextChannel } from "discord.js";

export default class Shuffle extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "shuffle",
			category: "Music",
			cooldown: 2 * 1000,
			nOfParams: 0,
			description: "Shuffles the queue and restores original order",
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

			controller.shuffleState
				? await reply("Command.Shuffle.Unshuffled", textChannel)
				: await reply("Command.Shuffle.Shuffled", textChannel);

			controller.shuffle();
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
