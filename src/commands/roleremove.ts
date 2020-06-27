import ValClient from '../ValClient';

import { Command, CommandContext } from '../structures';
import { createRoleEmbed } from '../utils/embed';
import { log, notify } from '../utils/general';
import { getRoleObject, getMemberObject } from '../utils/object';

export default class RoleRemove extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `roleremove`,
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 2,
			description: `بتشيل روول من ميمبر`,
			exampleUsage: `@Sovereign#4984 <role_name|role_id>`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { CHANNEL_MOD_LOGS } = this.client.config.CHANNELS;
		const { message, params, channel, member } = context;
		const roleNameRegex = /\w+/i;
		const roleIDRegex = /\d+/i;
		const mentionRegex = /<@!(\d+)>/;

		if (!roleNameRegex.test(params[1]) && !roleIDRegex.test(params[1]))
			return message.reply('لازم تكتب اسم او الاي دي بتاع الروول');

		if (!mentionRegex.test(params[0]))
			return message.reply('لازم تعمل منشن للميمبر اللي عايز تديله الروول ده');

		const roleID =
			params[1].match(roleNameRegex)[0] || params[1].match(roleIDRegex)[0];
		const targetMemberID = params[0].match(mentionRegex)[1];

		const role = getRoleObject(this.client, roleID);
		const targetMember = getMemberObject(this.client, targetMemberID);

		const embed = createRoleEmbed({
			title: 'Member Role Removed',
			member: targetMemberID,
			moderator: member.id,
			channel: channel.id,
			role: role.id
		});

		targetMember.roles
			.remove(role)
			.then(() => {
				notify({
					client: this.client,
					notification: `<@${targetMemberID}>`,
					embed,
					channel: CHANNEL_MOD_LOGS
				});
				message.reply(`شيلت روول ${role.name} من الميمبر ده`);
			})
			.catch(err => {
				log(this.client, err, 'error');
			});
	};
}
