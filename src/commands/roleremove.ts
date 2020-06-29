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
			exampleUsage: `<mention> <role_name|role_id>`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { CHANNEL_MOD_LOGS } = this.client.config;
		const { message, params, channel, member } = context;

		const roleNameRegex = /\w+/i;
		const roleIDRegex = /\d+/i;
		const mentionRegex = /<@!(\d+)>/;

		try {
			if (!roleNameRegex.test(params[1]) && !roleIDRegex.test(params[1])) {
				await message.reply('لازم تكتب اسم او الاي دي بتاع الروول');
				return;
			}

			if (!mentionRegex.test(params[0])) {
				await message.reply('لازم تعمل منشن للميمبر اللي عايز تديله الروول ده');
				return;
			}

			const roleID =
				params[1].match(roleNameRegex)[0] || params[1].match(roleIDRegex)[0];
			const targetMemberID = params[0].match(mentionRegex)[1];

			const role = getRoleObject(this.client, roleID);

			if (!role) {
				await message.reply('الروول ده مش موجود');
				return;
			}

			const targetMember = getMemberObject(this.client, targetMemberID);

			const embed = createRoleEmbed({
				title: 'Member Role Removed',
				member: targetMemberID,
				moderator: member.id,
				channel: channel.id,
				role: role.id
			});

			await Promise.all([
				targetMember.roles.remove(role),
				notify({
					client: this.client,
					notification: `<@${targetMemberID}>`,
					embed,
					channel: CHANNEL_MOD_LOGS
				}),
				message.reply(`شيلت روول ${role.name} من الميمبر ده`)
			]);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
