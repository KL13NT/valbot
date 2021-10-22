import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { RemindersController } from "../controllers";

export default class Reminders extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "reminders",
			category: "Misc",
			cooldown: 30 * 1000,
			nOfParams: 0,
			description: "هقولك ال reminders بتوعك",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_VERIFIED",
			},
		});
	}

	_run = async (context: CommandContext): Promise<void> => {
		const reminders = <RemindersController>(
			this.client.controllers.get("reminders")
		);

		const { message, member } = context;

		const active = await reminders.getMemberReminders(member.id);
		if (active.length === 0) {
			await message.reply("معندكش اي reminders.");
			return;
		}

		const all = active.reduce((all, curr) => {
			const { description } = curr.subs.find(sub => sub.member === member.id);
			const date = new Date(curr.time).toString();

			return `${all}\n\n${description}\n${date}`;
		}, "");

		await message.reply(`الـ reminders بتوعك:\n${all}`);
	};
}
