import Listener from '../structures/Listener';
import ValClient from '../ValClient';

import { log } from '../utils/general';

export default class QueueExecuteListener extends Listener {
	constructor(client: ValClient) {
		super(client);

		this.events.set('queueExecute', this.onQueueExecute);
	}

	onQueueExecute = async (reason: string): Promise<void> => {
		this.client.controllers.get('queue').executeAll();
		log(this.client, `Executing all queued calls. Reason: ${reason}`, 'info');
	};
}
