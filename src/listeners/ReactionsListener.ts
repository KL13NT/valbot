import Listener from "../structures/Listener";
import ValClient from "../ValClient";

// import { log } from "../utils/general";
import { MessageReaction, User } from "discord.js";
import { ToxicityController } from "../controllers";
import { log } from "../utils/general";

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
			log(this.client, err, "error");
		}
	};
}
