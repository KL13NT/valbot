import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { Message } from "discord.js";
import {
	ToxicityController,
	LevelsController,
	ConversationController,
} from "../controllers";
import { isAdmin, isDev } from "../utils/general";
import logger from "../utils/logging";

export default class MessageListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["message"]);
	}

	onMessage = async (message: Message): Promise<void> => {
		try {
			if (!this.shouldHandle(message)) return;

			const { prefix, controllers } = this.client;
			const { content, mentions } = message;

			const levels = <LevelsController>controllers.get("levels");
			const toxicity = <ToxicityController>controllers.get("toxicity");
			const conversation = <ConversationController>(
				controllers.get("conversation")
			);

			const nsfw = message.channel.type === "text" && message.channel.nsfw;
			const classification = nsfw ? [] : await toxicity.classify(message);

			if (classification.length > 0)
				await toxicity.report(message, classification);

			const isClientMentioned =
				mentions.members &&
				mentions.members.some(m => m.id === this.client.user.id);

			if (content.startsWith(prefix)) this.client.emit("command", message);
			else if (isClientMentioned) conversation.converse(message, true);

			levels.message(message);
		} catch (error) {
			logger.error(error);
		}
	};

	/**
	 * Handling conditions
	 * - Author must not be a webhook
	 * - Author must not be the bot
	 * - Channel must be type 'text'
	 * - MessageType must be 'default'
	 * - If in DEV MODE then only ADMIN allowed to use
	 */
	shouldHandle = ({
		author,
		channel,
		type,
		webhookID,
		member,
	}: Message): boolean =>
		!webhookID &&
		this.client.ready &&
		author.id !== this.client.user.id &&
		channel.type === "text" &&
		type === "DEFAULT" &&
		(!isDev() ||
			isAdmin(member) ||
			member.roles.cache.some(role => role.id === process.env.ROLE_DEVELOPER));
}
