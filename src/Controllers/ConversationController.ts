import ValClient from '../ValClient';
import MongoController from './MongoController';
import { QueueController } from '.';
import Controller from '../structures/Controller';
import { Response } from '../types/interfaces';
import { Message } from 'discord.js';

const { log } = require('../utils/general');

export default class ConversationController extends Controller {
	private ready: boolean = false;
	private responses: {
		[index: string]: Response;
	} = {};

	constructor(client: ValClient) {
		super(client, {
			name: 'conversation'
		});

		this.init();
	}

	init = async () => {
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
			//TODO: move to events
			const message = `Something went wrong when initialising ConversationController, ${err.message}`;

			log(this.client, message, 'error');
		}
	};

	converse = async (message: Message, isClientMentioned: boolean) => {
		const response = Object.values(this.responses).find(response =>
			new RegExp(`${response.invoker}`, 'gi').test(message.content)
		);

		//TODO: remove duplicate isClientMentioned logic
		if (response) {
			message.reply(response.reply);
		} else if (isClientMentioned)
			message.reply(
				`لو محتاجين مساعدة تقدروا تكتبوا \`${this.client.prefix} help\``
			);
	};

	async teach(response: Response) {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		this.responses[response.invoker] = response;

		if (mongo.ready) mongo.saveResponse(response);
		else queue.enqueue(this.teach, response);
	}

	getAllResponses() {
		return this.responses;
	}
}
