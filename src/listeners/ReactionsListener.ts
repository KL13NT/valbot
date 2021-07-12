import Listener from "../structures/Listener";
import ValClient from "../ValClient";

// import { log } from "../utils/general";
import { MessageReaction, User } from "discord.js";
import { ToxicityController } from "../controllers";

export default class ReactionsListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["messageReactionAdd"]);
	}

	onMessageReactionAdd = async (
		reaction: MessageReaction,
		user: User,
	): Promise<void> => {
		(<ToxicityController>this.client.controllers.get("toxicity")).react(
			reaction,
			user,
		);
	};
}
