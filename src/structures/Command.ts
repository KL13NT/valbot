import CommandContext from "./CommandContext";
import ValClient from "../ValClient";

import {
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED,
	ERROR_COMMAND_NOT_READY,
} from "../config/events.json";

import { generateParamError , isAllowed, isEachParamValid, help } from "../utils/commands";
import { CommandOptions } from "../types/interfaces";
import { Message } from "discord.js";


export default abstract class Command {
	client: ValClient;
	ready: boolean;
	cooldownTimer: NodeJS.Timeout;
	options: CommandOptions;

	constructor(client: ValClient, options: CommandOptions) {
		this.client = client;
		this.options = options;
		this.ready = true;
	}

	run = async (message: Message): Promise<void> => {
		if (!this.client.ready && this.options.name !== "setup") {
			message.reply(
				`مش جاهز لسه او البوت مش معمله setup. شغلوا \`${this.client.prefix} setup\``,
			);
			return;
		}

		const context = new CommandContext(this.client, message);

		if (context.params[0] === "help") {
			help(this.client, this.options, context);
			return;
		}

		if (!isAllowed(this.client, this.options, context)) {
			message.reply(ERROR_COMMAND_NOT_ALLOWED);
			return;
		}

		if (!isEachParamValid(this.options, context.params)) {
			message.reply(generateParamError(this.client, this.options));
			return;
		}

		this.enforceCooldown(context);
	};

	private enforceCooldown = (context: CommandContext): void => {
		const { cooldown } = this.options;

		if (this.ready) this._run(context);
		else context.message.reply(ERROR_COMMAND_NOT_READY);

		if (cooldown !== 0) {
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
	abstract _run(context: CommandContext): Promise<void>;

	/**
	 * cancels an ongoing command
	 */
	stop = (context: CommandContext, isGraceful: boolean, error: Error): void => {
		if (!isGraceful)
			context.message.reply(error.message || ERROR_GENERIC_SOMETHING_WENT_WRONG);
		else context.message.reply(GENERIC_CONTROLLED_COMMAND_CANCEL);

		this.ready = true;

		clearTimeout(this.cooldownTimer);
	};
}
