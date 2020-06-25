import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { Message } from 'discord.js';
import {
	ToxicityController,
	LevelsController,
	ConversationController
} from '../Controllers';

const { CLIENT_ID, DEV_CLIENT_ID } = process.env;

export default class MessageListener extends Listener {
	constructor(client: ValClient) {
		super(client);

		this.events.set('message', this.onMessage);
	}

	onMessage = async (message: Message): Promise<void> => {
		if (this.shouldNotHandle(message)) return;

		const { prefix, controllers } = this.client;
		const { content, mentions } = message;

		const conversation = <ConversationController>(
			controllers.get('conversation')
		);
		const levels = <LevelsController>controllers.get('levels');
		const toxicity = <ToxicityController>controllers.get('toxicity');

		const isToxic = await toxicity.classify(message);
		const isClientMentioned =
			mentions.members &&
			mentions.members.some(m => m.id === CLIENT_ID || m.id === DEV_CLIENT_ID);

		if (isToxic) return toxicity.handleToxic(message);

		if (content.startsWith(prefix)) this.client.emit('command', message);
		else if (isClientMentioned) conversation.converse(message, true);

		levels.message(message);
	};

	shouldNotHandle = ({ author, channel, type, webhookID }: Message): boolean =>
		!!webhookID ||
		author.id === CLIENT_ID ||
		author.id === DEV_CLIENT_ID ||
		channel.type !== 'text' ||
		type !== 'DEFAULT';
}
