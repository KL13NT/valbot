import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { awaitMessages } from "../utils/general";
import { getRoleObject } from "../utils/object";
import { TextChannel } from "discord.js";
import { LevelsController } from "../controllers";

export default class MilestoneAdd extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `milestoneadd`,
			category: "Management",
			cooldown: 1000,
			nOfParams: 2,
			description: `بتحدد achievement تدي الميمبرز روول معين عند ليفل معين.`,
			exampleUsage: `<level> <role_name|role_id>`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async (context: CommandContext) => {
		const levels = <LevelsController>this.client.controllers.get("levels");

		const { message, member, params } = context;
		const channel = <TextChannel>context.channel;

		const levelRegex = /^(\d+)$/i;
		const roleNameRegex = /^(\S+)$/i;
		const roleIDRegex = /^<?@?&?(\d+)>?$/i;
		const nameRegex = /([a-zA-Z0-9 ]{1,40})/i;
		const descriptionRegex = /(.{30,300})/i;

		const level = Number(params[0].match(levelRegex)[0]);

		const roleIDNameMatch =
			params[1].match(roleIDRegex) || params[1].match(roleNameRegex);

		if (isNaN(level)) {
			await message.reply(
				"لازم تحدد الـ level اللي عايز تعمل عليه الـ milestone",
			);
			return;
		}

		if (!roleIDNameMatch) {
			await message.reply("لازم تكتب اسم او الاي دي بتاع الروول");
			return;
		}

		const roleIDName = roleIDNameMatch[1];
		const role = getRoleObject(this.client, roleIDName);

		if (typeof role !== "object") {
			await message.reply("لازم ال role يكون موجود في السيرفر");
			return;
		}

		await message.reply("ايه اسم الـ achievement؟");

		const name = await awaitMessages(channel, member);

		if (!nameRegex.test(name)) {
			await message.reply(
				"الاسم لازم يبقى مابين 1 و 40 حرف, و يبقى فيه حروف و مسافات و ارقام فقط و يكون انجلش",
			);
			return;
		}

		await message.reply("ايه وصف الـ achievement؟");

		const description = await awaitMessages(channel, member);

		if (!descriptionRegex.test(description)) {
			await message.reply("الوصف لازم يكون مابين 30 و 300 حرف, و يكون انجلش");
			return;
		}

		await levels.addMilestone(level, name, description, role.id);

		await message.reply("ضيفت الـ milestone دي. ");
	};
}
