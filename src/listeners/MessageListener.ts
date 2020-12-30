import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { Message } from "discord.js";
import {
	ToxicityController,
	LevelsController,
	ConversationController,
} from "../controllers";
import { log } from "../utils/general";

export default class MessageListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["message"]);
	}

	onMessage = async (message: Message): Promise<void> => {
		try {
			if (this.shouldNotHandle(message)) return;

			const { prefix, controllers } = this.client;
			const { content, mentions } = message;

			const levels = <LevelsController>controllers.get("levels");
			const toxicity = <ToxicityController>controllers.get("toxicity");
			const conversation = <ConversationController>(
				controllers.get("conversation")
			);

			const isToxic = await toxicity.classify(message);

			if (isToxic) return toxicity.handleToxic(message);

			const isClientMentioned =
				mentions.members &&
				mentions.members.some(m => m.id === this.client.user.id);

			if (content.startsWith(prefix)) this.client.emit("command", message);
			else if (isClientMentioned) conversation.converse(message, true);

			levels.message(message);
		} catch (error) {
			log(this.client, error, "error");
		}
	};

	shouldNotHandle = ({ author, channel, type, webhookID }: Message): boolean =>
		!!webhookID ||
		author.id === this.client.user.id ||
		channel.type !== "text" ||
		type !== "DEFAULT";
}
