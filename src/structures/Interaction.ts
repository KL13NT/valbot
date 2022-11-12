import ValClient from "../ValClient";

import {
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED,
	ERROR_COMMAND_NOT_READY,
} from "../config/events.json";

import { isAllowed } from "../utils/commands";
import { InteractionOptions } from "../types/interfaces";
import { CommandInteraction, TextChannel } from "discord.js";
import { isDev } from "../utils/general";
import { handleUserError } from "../utils/apis";
import InteractionContext from "./InteractionContext";

export default abstract class Interaction {
	client: ValClient;
	ready: boolean;
	cooldownTimer: NodeJS.Timeout;
	options: InteractionOptions;

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

		if (this.ready) await this._run(context);
		else await context.interaction.reply(ERROR_COMMAND_NOT_READY);

		if (cooldown !== 0 && !isDev()) {
			this.ready = false;

			this.cooldownTimer = setTimeout(() => {
				this.ready = true;
			}, cooldown);
		}
	};

	/**
	 * Responsible for running commands.
	 * @abstract
	 */
	abstract _run(context: InteractionContext): Promise<void>;

	/**
	 * cancels an ongoing command
	 */
	stop = (
		context: InteractionContext,
		isGraceful: boolean,
		error: Error,
	): void => {
		if (!isGraceful)
			context.interaction.reply(
				error.message || ERROR_GENERIC_SOMETHING_WENT_WRONG,
			);
		else context.interaction.reply(GENERIC_CONTROLLED_COMMAND_CANCEL);

		this.ready = true;

		clearTimeout(this.cooldownTimer);
	};
}
