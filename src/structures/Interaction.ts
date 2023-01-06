import ValClient from "../ValClient";

import { ERROR_COMMAND_NOT_ALLOWED } from "../config/events.json";

import { isAllowed } from "../utils/commands";
import { InteractionOptions } from "../types/interfaces";
import { CommandInteraction, Snowflake, TextChannel } from "discord.js";
import { isDev, reply } from "../utils/general";
import { handleUserError } from "../utils/apis";
import InteractionContext from "./InteractionContext";

export default abstract class Interaction {
	client: ValClient;
	ready: boolean;
	options: InteractionOptions;
	static cooldown: Map<Snowflake, Date> = new Map();

	constructor(client: ValClient, options: InteractionOptions) {
		this.client = client;
		this.options = options;
		this.ready = true;
	}

	run = async (interaction: CommandInteraction): Promise<void> => {
		try {
			if (!this.client.ready && this.options.name !== "setup") {
				await interaction.reply(
					`مش جاهز لسه او البوت مش معمله setup. شغلوا \`${this.client.prefix} setup\``,
				);
				return;
			}

			const context = new InteractionContext(this.client, interaction);

			if (!isAllowed(this.client, this.options, context)) {
				await interaction.reply(ERROR_COMMAND_NOT_ALLOWED);
				return;
			}

			await this.enforceCooldown(context);
		} catch (error) {
			handleUserError(error, interaction.channel as TextChannel, interaction);
		}
	};

	private enforceCooldown = async (
		context: InteractionContext,
	): Promise<void> => {
		const { cooldown } = this.options;

		const lastExecuted = Interaction.cooldown.get(context.member.id);
		const allowed = lastExecuted
			? Date.now() - lastExecuted.getTime() >= cooldown
			: true;

		if (allowed || isDev()) {
			Interaction.cooldown.set(context.member.id, new Date());
			await this._run(context);
		} else {
			await reply(
				"Command.Play.NotReady",
				context.channel,
				null,
				context.interaction,
			);
		}
	};

	/**
	 * Responsible for running commands.
	 * @abstract
	 */
	abstract _run(context: InteractionContext): Promise<void>;
}
