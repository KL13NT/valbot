import ValClient from "../ValClient";

import { TextChannel } from "discord.js";

import { Command, CommandContext } from "../structures";
import { log, awaitMessages, chronoResultToObject } from "../utils/general";
import { ReminderSubscription } from "../types/interfaces";
import { RemindersController } from "../controllers";
import { parse } from "chrono-node";
import { createEmbed } from "../utils/embed";

export default class Remindme extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "remindme",
			category: "Misc",
			cooldown: 30 * 1000,
			nOfParams: 1,
			description: "قولي افكرك بحاجة امتى و هفكرك. UTC بالأساس.",
			exampleUsage:
				"Valarium's next session 12 may 5 PM GMT+2\nValarium's next session this saturday 5 PM UTC",
			extraParams: true,
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

		const { message, member, params } = context;
		const channel = <TextChannel>context.channel;

		try {
			const results = parse(
				params.join(" "),
				{ timezone: "UTC" },
				{ forwardDate: true },
			);

			if (results.length === 0) {
				await message.reply("مش فاهم لول, متأكد انكوا كتبتوا وقت؟");
				return;
			}

			// sometimes results will be more than 1 result, so we need to combine
			// them together, always using the latest values, using impliedValues as
			// basis to make sure date variables properties aren't passed null to the
			// date constructor
			const { year, month, day, hour, minute } = results.reduce(
				(t, c) => ({
					...t,
					...chronoResultToObject(c),
				}),
				chronoResultToObject(results[0]),
			);

			const date = new Date(year, month - 1, day, hour, minute, 0, 0);

			if (isNaN(date.getTime()) || new Date().getTime() >= date.getTime()) {
				const lolreally = this.client.emojis.cache.find(
					emoji => emoji.name === "lolreally",
				);

				await message.reply(
					`مينفعش تعمل ريمايندر لوقت سابق. بلاش هزار. ${lolreally}`,
				);

				return;
			}

			const description = params
				.filter(param => !results.some(result => result.text.includes(param)))
				.join(" ");

			console.log(description);

			const confirmationEmbed = createEmbed({
				title: "Confirmation (yes/no)",
				description: `انا فاهمك صح كده؟`,
				fields: [
					{
						name: "**هفكرك بـ**",
						value: description,
					},
					{
						name: "**تاريخ**",
						value: date.toUTCString(),
					},
				],
				footer: { text: "رد في خلال دقيقة وإلا هعتبر الـ reminder لاغي" },
			});

			await message.reply(confirmationEmbed);
			const correct = await awaitMessages(channel, member);

			if (correct.toLowerCase() === "no") {
				await message.reply("Discarded the reminder");
				return;
			}

			const sub: ReminderSubscription = {
				description,
				member: member.id,
			};

			const active = await reminders.getMemberReminders(member.id);
			if (active.length >= 2) {
				await message.reply("مينفعش تعمل اكتر من 2 ريمايندرز");
				return;
			}

			if (active.find(sub => sub.time === date.getTime())) {
				await message.reply("انت مسجل ف الوقت ده بالفعل");
				return;
			}

			await reminders.addReminder(date.getTime(), sub);
			await message.reply(`تم. هفكرك في \n${date.toString()}`);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
