import ValClient from '../ValClient';

import { Controller } from '../structures';
import { Reminder, ReminderSubscription } from '../types/interfaces';
import { MongoController, QueueController } from '.';

export default class RemindersController extends Controller {
	ready: boolean;
	reminders: Map<string, ReminderSubscription[]>;

	constructor(client: ValClient) {
		super(client, {
			name: 'reminders'
		});
	}

	init = async () => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		if (!mongo.ready) {
			queue.enqueue({ func: this.init, args: [] });
			return;
		}

		const reminders: Reminder[] = await mongo.db
			.collection('reminders')
			.find({})
			.toArray();

		reminders.forEach(reminder => {
			this.reminders.set(String(reminder.time), reminder.subs);
		});

		this.ready = true;
	};

	getReminder = (time: number) => {
		return this.reminders.get(String(time));
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
