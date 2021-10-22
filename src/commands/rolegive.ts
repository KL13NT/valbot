import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { getRoleObject, getMemberObject } from "../utils/object";
import { createRoleEmbed } from "../utils/embed";
import { notify } from "../utils/general";

export default class RoleGive extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "rolegive",
			category: "Moderation",
			cooldown: 1000,
			nOfParams: 2,
			description: "بتدي لميمبر روول معين.",
			exampleUsage: "<mention> <role_name|role_id>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_MOD",
			},
		});
	}

	_run = async (context: CommandContext) => {
		const { CHANNEL_MOD_LOGS } = this.client.config;
		const { message, params, member, channel } = context;

		const roleNameRegex = /.+/i;
		const roleIDRegex = /\d+/i;
		const mentionRegex = /<@!(\d+)>/;

		const roleName = params.slice(1).join(" ");
		const roleID =
			roleName.match(roleNameRegex) || params[1].match(roleIDRegex);

		if (!roleID) {
			await message.reply("لازم تكتب اسم او الاي دي بتاع الروول");
			return;
		}

		if (!mentionRegex.test(params[0])) {
			await message.reply("لازم تعمل منشن للميمبر اللي عايز تديله الروول ده");
			return;
		}

		const targetMemberID = params[0].match(mentionRegex)[1];
		const role = getRoleObject(this.client, roleID[0]);

		if (!role) {
			await message.reply("الروول مش موجود");
			return;
		}

		const targetMember = getMemberObject(this.client, targetMemberID);

		const embed = createRoleEmbed({
			title: "Member Role Added",
			member: targetMemberID,
			moderator: member.id,
			channel: channel.id,
			role: role.id,
		});

		await Promise.all([
			targetMember.roles.add(role),
			notify({
				client: this.client,
				notification: `<@${targetMemberID}>`,
				embed,
				channel: CHANNEL_MOD_LOGS,
			}),
			message.reply(`اديت الميمبر ده روول ${role.name}`),
		]);
	};
}
