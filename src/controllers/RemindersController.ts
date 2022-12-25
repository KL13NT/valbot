import ValClient from "../ValClient";
import logger from "../utils/logging";

import { Controller } from "../structures";
import { Reminder, ReminderSubscription } from "../types/interfaces";
import { MongoController, IntervalsController } from ".";
import { reminderSubsToString, splitMessage } from "../utils/general";
import { getChannelObject } from "../utils/object";
import { Snowflake } from "discord.js";

export default class RemindersController extends Controller {
	ready: boolean;
	private reminders = new Map<string, ReminderSubscription[]>();

	constructor(client: ValClient) {
		super(client, {
			name: "reminders",
		});
	}

	init = async () => {
		const intervals = <IntervalsController>(
			this.client.controllers.get("intervals")
		);

		await this.handleStale();
		await this.fetchNextHour();

		intervals.set({
			callback: this.check,
			name: "reminders",
			time: 1000 * 60,
		});

		this.ready = true;
	};

	fetchNextHour = async () => {
		try {
			const mongo = <MongoController>this.client.controllers.get("mongo");

			const nextHour = new Date();
			nextHour.setHours(nextHour.getHours() + 1);

			const reminders: Reminder[] = await mongo.db
				.collection("reminders")
				.find({
					time: {
						$lte: nextHour.getTime(),
						// to get all reminders that are supposed to happen next between now
						// and next hour AND any that may have been missed because of a bot
						// restart etc
					},
				})
				.toArray();

			reminders.forEach(reminder => {
				this.reminders.set(String(reminder.time), reminder.subs);
			});
		} catch (err) {
			logger.error(err);
		}
	};

	handleStale = async () => {
		try {
			const mongo = <MongoController>this.client.controllers.get("mongo");

			const now = new Date();

			const reminders: Reminder[] = await mongo.db
				.collection("reminders")
				.find({
					time: {
						$lte: now.getTime(),
						// to get all reminders that are supposed to happen next between now
						// and next hour AND any that may have been missed because of a bot
						// restart etc
					},
				})
				.toArray();

			if (reminders.length === 0) return;

			let message = "**Stale Reminders**\n";

			message += reminders.reduce<string>((stale, curr) => {
				const date = new Date(curr.time).toUTCString();
				const subs = reminderSubsToString(curr.subs);

				return `${date}${stale}\n${subs}`;
			}, "");

			const { CHANNEL_NOTIFICATIONS } = this.client.config;
			const channel = getChannelObject(this.client, CHANNEL_NOTIFICATIONS);

			await channel.send(message);

			await mongo.db.collection("reminders").deleteMany({
				time: {
					$lte: now.getTime(),
					// to get all reminders that are supposed to happen next between now
					// and next hour AND any that may have been missed because of a bot
					// restart etc
				},
			});
		} catch (err) {
			logger.error(err);
		}
	};

	check = async () => {
		// Instead of fetching all data from the database which might use a lot of
		// memory and make all db operations slow we could opt for partials.
		// Partials would be defined as a set of records for the next hour or so,
		// reducing the amount of queries per hour to only 1 instead of 60, meaning
		// that a day would equal 24 queries instead of 1440.
		// This improves memory allocation and network traffic.

		const { CHANNEL_NOTIFICATIONS } = this.client.config;
		const date = new Date();
		const now = Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			0,
		);

		try {
			const current = this.reminders.get(String(now));
			if (current) {
				const channel = getChannelObject(this.client, CHANNEL_NOTIFICATIONS);

				const subscriptionsString = reminderSubsToString(current);
				const messages = splitMessage(
					`**Reminders** \n${subscriptionsString}`,
					{
						maxLength: 2000,
					},
				);

				for (const message of messages) {
					await channel.send({
						content: message,
						options: {},
					});
				}

				await this.clear(now);
				this.reminders.delete(String(now));
			}

			// update cached reminders
			if (date.getMinutes() === 0) {
				this.reminders.clear();
				await this.fetchNextHour();
			}
		} catch (err) {
			logger.error(err);
		}
	};

	getReminder = (time: number) => {
		return this.reminders.get(String(time));
	};

	getMemberReminders = (member: Snowflake): Promise<Reminder[]> => {
		const mongo = <MongoController>this.client.controllers.get("mongo");

		return mongo.db
			.collection("reminders")
			.find({ "subs.member": member })
			.toArray();
	};

	addReminder = async (time: number, sub: ReminderSubscription) => {
		const mongo = <MongoController>this.client.controllers.get("mongo");

		const reminder = this.reminders.get(String(time));
		if (!reminder) this.reminders.set(String(time), []);

		this.reminders.get(String(time)).push(sub);

		return mongo.db.collection("reminders").findOneAndUpdate(
			{ time },
			{
				$push: {
					subs: sub,
				},
			},
			{
				upsert: true,
			},
		);
	};

	clear = async (time: number) => {
		const mongo = <MongoController>this.client.controllers.get("mongo");

		this.reminders.delete(String(time));
		return mongo.db.collection("reminders").findOneAndDelete({ time });
	};
}
