const { ROLE_DEVELOPER } = process.env;

import CommandContext from './CommandContext';
import ValClient from '../ValClient';

import {
	GENERIC_SOMETHING_WENT_WRONG,
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED,
	ERROR_COMMAND_NOT_READY,
	ERROR_INSUFFICIENT_PARAMS_PASSED
} from '../config/events.json';

import { log } from '../utils/general';
import { createEventMessage } from '../utils/event';
import { getRoleObject } from '../utils/object';
import { createEmbed } from '../utils/embed';
import { CommandOptions } from '../types/interfaces';
import { Message, Role } from 'discord.js';

export default abstract class Command {
	private client: ValClient;
	private options: CommandOptions;
	private ready: boolean;
	private cooldownTimer: NodeJS.Timeout;

	constructor(client: ValClient, options: CommandOptions) {
		this.client = client;
		this.options = options;
		this.ready = true;
	}

	/**
	 * Determines whether user is allowed to use this command
	 */
	//REFACTORME: Move this logic to a command controller
	run = (message: Message): void => {
		if (!this.client.ready && this.options.name !== 'setup') {
			message.reply(
				`مش جاهز لسه او البوت مش معمله setup. شغلوا \`${this.client.prefix} setup\``
			);
			return;
		}

		message.content = message.content.replace(/\s+/g, ' ');

		const split = message.content.split(' ');
		const params = split.slice(2);

		if (this.enforceParams(params, message) === true) {
			const context = new CommandContext(this.client, message);
			context.params = params;

			if (this.isAllowed(context)) this.enforceCooldown(context);
			else message.reply(ERROR_COMMAND_NOT_ALLOWED);
		}
	};

	/**
	 * Checks whether member has sufficient auth
	 */
	//REFACTORME: move helper methods into CommandUtils
	private isAllowed = (context: CommandContext): boolean => {
		const { member } = context;

		if (member && member.hasPermission('ADMINISTRATOR')) return true;

		if (this.options.auth.devOnly) return this.isDevCommand(context);
		else return this.isAllowedRoles(context);
	};

	private isDevCommand = (context: CommandContext) => {
		const { member } = context;

		return member ? member.roles.cache.has(ROLE_DEVELOPER) : false;
	};

	private isAllowedRoles = (context: CommandContext) => {
		const { member } = context;
		const { required } = this.options.auth;

		const AUTH_ROLES = this.client.config.AUTH;
		const allRoles = Object.values(AUTH_ROLES);

		const requiredRole: string = AUTH_ROLES[required];
		const indexOfRequiredRole = allRoles.indexOf(requiredRole);

		//REFACTORME: move this to a hasRole()

		return member.roles.cache.some((role: Role) => {
			const indexOfMemberRole = allRoles.indexOf(role.id);

			if (
				role.id === requiredRole ||
				(indexOfMemberRole > -1 && indexOfMemberRole <= indexOfRequiredRole)
			)
				return true;

			return false;
		});
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

	//REFACTORME: return type more specific
	private enforceParams = (params: string[], message: Message): boolean => {
		const { nOfParams, extraParams, optionalParams } = this.options;

		if (params[0] === 'help') this.help(message);
		else if (
			params.length < nOfParams - optionalParams ||
			(params.length > nOfParams && !extraParams)
		)
			message.reply(
				createEventMessage(ERROR_INSUFFICIENT_PARAMS_PASSED, [
					{
						name: '_PREFIX',
						value: this.client.prefix
					},
					{
						name: 'COMMAND_NAME',
						value: this.options.name
					}
				])
			);
		else return true;
	};

	/**
	 * Responsible for running commands.
	 * @abstract
	 */
	abstract async _run(context: CommandContext): Promise<void>;

	/**
	 * cancels an ongoing command
	 */
	stop = (context: CommandContext, isGraceful: boolean, error: Error): void => {
		if (!isGraceful)
			context.message.reply(error || ERROR_GENERIC_SOMETHING_WENT_WRONG);
		else context.message.reply(GENERIC_CONTROLLED_COMMAND_CANCEL);

		this.ready = true;

		clearTimeout(this.cooldownTimer);
	};

	/**
	 * Replies to message with proper help
	 * @param {GuildMessage} message message to reply to
	 */
	help = (message: Message): void => {
		const { member } = message;
		const {
			name,
			nOfParams,
			exampleUsage,
			description,
			auth,
			category
		} = this.options;
		const { required, devOnly } = auth;
		const { AUTH } = this.client.config;

		const title = `**معلومات عن ${name}**\n`;
		const fields = [
			{
				name: '**الاستعمال**',
				value: `\`${this.client.prefix} ${this.options.name} ${exampleUsage}\``
			},
			{
				name: '**الوصف/الوظيفة**',
				value: `${description}`
			},
			{
				name: '**عدد الباراميترز**',
				value: `${nOfParams}`
			},
			{
				name: '**اقل role مسموح بيه**',
				value: getRoleObject(
					this.client,
					devOnly ? process.env.ROLE_DEVELOPER : AUTH[required]
				).name
			},
			{
				name: '**الفئة**',
				value: `${category}`
			}
		];

		const embed = createEmbed({ title, fields });
		member.createDM().then(dm => {
			dm.send(embed);
			message.reply('بعتلك رسالة جادة جداً').then(sent => {
				setTimeout(() => {
					sent.delete();
				}, 5 * 1000);
			});
		});
	};
}

module.exports = Command;
