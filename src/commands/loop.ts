import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import { MusicController } from "../controllers";
import { TextChannel } from "discord.js";
import { LoopState } from "../controllers/MusicController";

const LOOP_STATUS_MESSAGES: Record<LoopState, string> = {
	single: "Command.Loop.Single",
	queue: "Command.Loop.Queue",
	disabled: "Command.Loop.Disabled",
};

export default class Loop extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "loop",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description:
				"Toggles the queue looping mode between [none, single, queue]",
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

			if (!voiceChannel) {
				await reply("Command.Play.NotConnected", message.channel);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("Command.Play.NotAllowed", message.channel);
				return;
			}

			controller.loop();

			const { loopState } = controller;
			await reply(LOOP_STATUS_MESSAGES[loopState], textChannel);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
