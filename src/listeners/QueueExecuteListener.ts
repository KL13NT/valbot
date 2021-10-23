import Listener from "../structures/Listener";
import ValClient from "../ValClient";

import logger from "../utils/logging";
import { QueueController } from "../controllers";

export default class QueueExecuteListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["queueExecute"]);
	}

	onQueueExecute = async (reason: string): Promise<void> => {
		(<QueueController>this.client.controllers.get("queue")).executeAll();
		logger.info(`Executing all queued calls. Reason: ${reason}`);
	};
}
