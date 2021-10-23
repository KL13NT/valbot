import Listener from "../structures/Listener";
import ValClient from "../ValClient";

import { MessageReaction, User } from "discord.js";
import { ToxicityController } from "../controllers";
import logger from "../utils/logging";

export default class ReactionsListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["messageReactionAdd"]);
	}

	onMessageReactionAdd = async (
		reaction: MessageReaction,
		user: User,
	): Promise<void> => {
		try {
			(<ToxicityController>this.client.controllers.get("toxicity")).react(
				reaction,
				user,
			);
		} catch (err) {
			logger.error(err);
		}
	};
}
