import { Command, CommandContext } from "../structures";
import ValClient from "../ValClient";

import { Presence } from "../types/interfaces";
import { ActivityType } from "discord.js";
import { PresenceController } from "../controllers";

export default class PresenceSet extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "presenceset",
			category: "Management",
			cooldown: 1000,
			nOfParams: 3,
			description: "بتعدل على الـ presence",
			exampleUsage:
				"<PLAYING|STREAMING|LISTENING|WATCHING> <PRIORITY:TRUE|FALSE> <ACTIVITY:STRING>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async ({ params, message }: CommandContext) => {
		const [type, priority, ...name] = params;
		const activityType = <ActivityType>type;
		const controller = this.client.controllers.get(
			"presence",
		) as PresenceController;

		if (
			!/^(PLAYING|STREAMING|LISTENING|WATCHING)$/i.test(
				activityType.toLowerCase(),
			)
		) {
			await message.reply("حدد Type معروفة");
			return;
		}

		if (priority && !/^(true|false)$/i.test(priority.toLowerCase())) {
			await message.reply("لازم تحدد priority يا اما TRUE يا اما FALSE");
			return;
		}

		const isPriority = !!(priority && priority.toLowerCase() === "true");

		const presence: Presence = {
			status: "dnd",
			activity: {
				name: name.join(" "),
				type: activityType,
			},
			priority: isPriority,
		};

		await controller.addPresence(presence);

		await message.reply("تم");
	};
}
