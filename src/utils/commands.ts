const { ROLE_DEVELOPER } = process.env;

import { CommandContext } from '../structures';
import { CommandOptions } from '../types/interfaces';

import ValClient from '../ValClient';

import { getRoleObject } from './object';
import { createEmbed } from './embed';
import { createEventMessage } from './event';

import { ERROR_INSUFFICIENT_PARAMS_PASSED } from '../config/events.json';
import { log } from './general';

// Client.config has all config variables, not only auth roles, how is it possible to use for auth only? Mongo preserves the ordering of documents keys, this allows us to store our auth roles in order without worrying.
// Regardless of index, comparison will always happen on a specific index range such as [4, 9] for 5 roles, and thus we can exploit the fact that config keys are ordered to implement the old algorithm.

// CHANNEL_XXXXXXX
// ...
// ROLE_XXXXXY
// ROLE_XXXXX5
// ROLE_XXXXX2
// ROLE_XXXXX1
// ROLE_XXXXX0
// ...

// User has role ROLE_XXXXX5, required is ROLE_XXXXX0
// Index of ROLE_XXXXX5 is always higher than ROLE_XXXXX0
// Thus user is authorised to use given command

export function isAllowed(
	client: ValClient,
	options: CommandOptions,
	context: CommandContext
) {
	const { member } = context;
	const { required } = options.auth;

	if (!member) return false;

	if (member.hasPermission('ADMINISTRATOR')) return true;
	if (options.auth.devOnly) return member.roles.cache.has(ROLE_DEVELOPER);
	else {
		const allRoles = Object.values(client.config);

		const requiredRole: string = client.config[required];
		const indexOfRequiredRole = allRoles.indexOf(requiredRole);

		return member.roles.cache.some(role => {
			const indexOfMemberRole = allRoles.indexOf(role.id);

			if (
				role.id === requiredRole ||
				(indexOfMemberRole > -1 && indexOfMemberRole <= indexOfRequiredRole)
			)
				return true;

			return false;
		});
	}
}

export function isEachParamValid(options: CommandOptions, params: string[]) {
	const { nOfParams, extraParams, optionalParams } = options;

	return (
		(params.length >= nOfParams - optionalParams &&
			params.length <= nOfParams) ||
		(extraParams && params.length >= nOfParams)
	);
}

export async function help(
	client: ValClient,
	options: CommandOptions,
	context: CommandContext
) {
	const { member, message } = context;
	const {
		name,
		nOfParams,
		exampleUsage,
		description,
		auth,
		category
	} = options;
	const { required, devOnly } = auth;

	const title = `**معلومات عن ${name}**\n`;
	const fields = [
		{
			name: '**الاستعمال**',
			value: `\`${client.prefix} ${name} ${exampleUsage.replace(
				'\n',
				`\n${client.prefix} ${name}`
			)}\``
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
				client,
				devOnly ? process.env.ROLE_DEVELOPER : client.config[required]
			).name
		},
		{
			name: '**الفئة**',
			value: `${category}`
		}
	];

	const embed = createEmbed({ title, fields });
	member
		.createDM()
		.then(async dm => {
			dm.send(embed);

			const sent = await message.reply('بعتلك رسالة جادة جداً');

			setTimeout(() => {
				sent.delete();
			}, 5 * 1000);
		})
		.catch(err => log(client, err, 'error'));
}

export function generateParamError(client: ValClient, options: CommandOptions) {
	return createEventMessage({
		template: ERROR_INSUFFICIENT_PARAMS_PASSED,
		variables: [
			{
				name: '_PREFIX',
				value: client.prefix
			},
			{
				name: 'COMMAND_NAME',
				value: options.name
			}
		]
	});
}
