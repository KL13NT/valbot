import ValClient from "../ValClient";

import { reply } from "../utils/general";
import { MusicController } from "../controllers";
import { TextChannel } from "discord.js";
import { LoopState } from "../controllers/MusicController";
import { getVoiceConnection } from "@discordjs/voice";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

const LOOP_STATUS_MESSAGES: Record<LoopState, string> = {
	single: "Command.Loop.Single",
	queue: "Command.Loop.Queue",
	disabled: "Command.Loop.Disabled",
};

export default class Loop extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "loop",
			category: "Music",
			cooldown: 2 * 1000,
			description: "Changes loop state to one of 'off', 'single', 'queue'.",
			options: [
				{
					name: "option",
					required: false,
					description: "single, queue or disabled",
					type: ApplicationCommandOptionType.String,
					choices: [
						{
							name: "Currently playing song",
							value: "single",
						},
						{
							name: "Entire queue",
							value: "queue",
						},
						{
							name: "Disabled",
							value: "disabled",
						},
					],
				},
			],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		interaction,
		channel,
		guild,
		params,
	}: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const connection = getVoiceConnection(guild.id);

		if (!connection) {
			await reply("Bot.VoiceNotConnected", channel, null, interaction);
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		const option = params.getString("option");
		if (!option) {
			const state = controller.loop();
			await reply(LOOP_STATUS_MESSAGES[state], textChannel, null, interaction);
			return;
		}

		const state = controller.loop(option as LoopState);
		await reply(LOOP_STATUS_MESSAGES[state], textChannel, null, interaction);
	};
}
