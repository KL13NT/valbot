import ValClient from '../ValClient';

import { Controller } from '../structures';
import { Reminder, ReminderSubscription } from '../types/interfaces';
import { MongoController, QueueController, IntervalsController } from '.';
import { log, reminderSubsToString } from '../utils/general';
import { getChannelObject } from '../utils/object';
import { Snowflake } from 'discord.js';

export default class RemindersController extends Controller {
	ready: boolean;
	private reminders = new Map<string, ReminderSubscription[]>();

	constructor(client: ValClient) {
		super(client, {
			name: 'reminders'
		});
	}

	init = async () => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');
		const intervals = <IntervalsController>(
			this.client.controllers.get('intervals')
		);

		if (!mongo.ready || !this.client.ready) {
			queue.enqueue({ func: this.init, args: [] });
			return;
		}

		await this.fetchNextHour();

		intervals.set({
			callback: this.check,
			name: 'reminders',
			time: 1000 * 60
		});

		this.ready = true;
	};

	fetchNextHour = async () => {
		try {
			const mongo = <MongoController>this.client.controllers.get('mongo');

			const nextHour = new Date();
			nextHour.setHours(nextHour.getHours() + 1);

			const reminders: Reminder[] = await mongo.db
				.collection('reminders')
				.find({
					time: {
						$lte: nextHour.getTime()
						// to get all reminders that are supposed to happen next between now
						// and next hour AND any that may have been missed because of a bot
						// restart etc
					}
				})
				.toArray();

			reminders.forEach(reminder => {
				this.reminders.set(String(reminder.time), reminder.subs);
			});
		} catch (err) {
			log(this.client, err, 'error');
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
			0
		);

		try {
			const current = this.reminders.get(String(now));
			if (current) {
				const channel = getChannelObject(this.client, CHANNEL_NOTIFICATIONS);

				const message = reminderSubsToString(current);

				await channel.send(`**Reminders** \n${message}`);
				this.reminders.delete(String(now));
			}

			// update cached reminders
			if (date.getMinutes() === 0) {
				this.reminders.clear();
				await this.fetchNextHour();
			}
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	getReminder = (time: number) => {
		return this.reminders.get(String(time));
	};

	countRemindersOfMember = (member: Snowflake) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');

		return mongo.db
			.collection('reminders')
			.find({ 'subs.member': member })
			.toArray();
	};

	addReminder = async (time: number, sub: ReminderSubscription) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		const reminder = this.reminders.get(String(time));

		if (!mongo.ready) {
			queue.enqueue({ func: this.addReminder, args: [time, sub] });
			return;
		}

		if (!reminder) this.reminders.set(String(time), []);

		this.reminders.get(String(time)).push(sub);

		return mongo.db.collection('reminders').findOneAndUpdate(
			{ time },
			{
				$push: {
					subs: sub
				}
			},
			{
				upsert: true
			}
		);
	};

	clearReminder = async (time: number) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		if (!mongo.ready) {
			queue.enqueue({ func: this.clearReminder, args: [time] });
			return;
		}

		this.reminders.delete(String(time));
		return mongo.db.collection('reminders').findOneAndDelete({ time });
	};
}
