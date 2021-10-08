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
			nOfParams: 1,
			description:
				"Changes loop state to one of 'off', 'single', 'queue'. Toggles between these states if not provided an option.",
			exampleUsage: "?<single|queue|disabled>",
			extraParams: false,
			optionalParams: 1,
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

			const match =
				params.length !== 0
					? params[0].match(/^(single|queue|disabled)$/i)
					: null;

			if (params.length === 0) controller.loop();
			else if (match) {
				const newLoopState = match[1] as LoopState;
				controller.loop(newLoopState);
			} else {
				await reply("Command.Loop.Invalid", textChannel);
				return;
			}

			const { loopState } = controller;
			await reply(LOOP_STATUS_MESSAGES[loopState], textChannel);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
