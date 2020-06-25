import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import MongoController from './MongoController';
import { QueueController } from '.';
const { log } = require('../utils/general');

export default class ConversationController extends Controller {
	private ready: boolean = false;
	private responses: object = {};

	constructor(client: ValClient) {
		super(client, {
			name: 'conversation'
		});

		this.init();
	}

	init = async (): Promise<void> => {
		try {
			const mongo = <MongoController>this.client.controllers.get('mongo');
			const queue = <QueueController>this.client.controllers.get('queue');
			if (mongo.ready) {
				const responses = await mongo.getResponses();

				responses.forEach(({ invoker, reply }) => {
					this.responses[invoker] = {
						invoker,
						reply
					};
				});
			} else {
				queue.enqueue(this.init);
			}
		} catch (err) {
			const message = `Something went wrong when initialising ConversationController, ${err.message}`;

			log(this.client, message, 'error');
		}
	};

	async converse(message, isClientMentioned) {
		const response = Object.values(this.responses).find(response =>
			new RegExp(`${response.invoker}`, 'gi').test(message.content)
		);

		if (response) {
			message.reply(response.reply);
		} else if (isClientMentioned)
			message.reply(
				`لو محتاجين مساعدة تقدروا تكتبوا \`${this.client.prefix} help\``
			);
	}

	async teach(response) {
		this.responses[response.invoker] = response;
		return this.client.controllers.mongo.saveResponse(response);
	}

	getAllResponses() {
		return this.responses;
	}
}
