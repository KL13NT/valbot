import Listener from '../structures/Listener';
import ValClient from '../ValClient';

import { log } from '../utils/general';
import { QueueController } from '../Controllers';

export default class QueueExecuteListener extends Listener {
	constructor(client: ValClient) {
		super(client);

		this.events.set('queueExecute', this.onQueueExecute);
	}

	onQueueExecute = async (reason: string): Promise<void> => {
		(<QueueController>this.client.controllers.get('queue')).executeAll();
		log(this.client, `Executing all queued calls. Reason: ${reason}`, 'info');
	};
}
