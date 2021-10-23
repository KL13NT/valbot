import ValClient from "../ValClient";
import MongoController from "./MongoController";
import { QueueController } from ".";
import Controller from "../structures/Controller";
import { Response } from "../types/interfaces";
import { Message } from "discord.js";

import logger from "../utils/logging";

export default class ConversationController extends Controller {
	public ready = false;
	private responses: {
		[index: string]: Response;
	} = {};

	constructor(client: ValClient) {
		super(client, {
			name: "conversation",
		});
	}

	init = async () => {
		try {
			const mongo = <MongoController>this.client.controllers.get("mongo");
			const queue = <QueueController>this.client.controllers.get("queue");

			if (mongo.ready) {
				const responses = await mongo.getResponses();

				responses.forEach(({ invoker, reply }) => {
					this.responses[invoker] = {
						invoker,
						reply,
					};
				});

				this.ready = true;
			} else {
				queue.enqueue({ func: this.init, args: [] });
			}
		} catch (err) {
			logger.error(err);
		}
	};

	converse = async (message: Message, isClientMentioned: boolean) => {
		const response = Object.values(this.responses).find(response =>
			new RegExp(`${response.invoker}`, "gi").test(message.content),
		);

		//TODO: remove duplicate isClientMentioned logic
		if (response) {
			message.reply(response.reply);
		} else if (isClientMentioned)
			message.reply(
				`لو محتاجين مساعدة تقدروا تكتبوا \`${this.client.prefix} help\``,
			);
	};

	async teach(response: Response) {
		const mongo = <MongoController>this.client.controllers.get("mongo");
		const queue = <QueueController>this.client.controllers.get("queue");

		this.responses[response.invoker] = response;

		if (mongo.ready) mongo.saveResponse(response);
		else queue.enqueue({ func: this.teach, args: [response] });
	}

	getAllResponses() {
		return this.responses;
	}
}
