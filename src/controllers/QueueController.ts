import Controller from '../structures/Controller';
import { QueueCall } from '../types/interfaces';
import ValClient from '../ValClient';

/**
 * @global
 */
export default class QueueController extends Controller {
	ready: boolean;
	calls: QueueCall[];

	constructor(client: ValClient) {
		super(client, {
			name: 'queue'
		});

		this.ready = true;
		this.calls = [];
	}

	enqueue = (call: QueueCall) => {
		this.calls.push(call);
	};

	executeAll = () => {
		for (let i = this.calls.length - 1; i >= 0; i--) {
			this.calls[i].func.call(this, ...this.calls[i].args);
			this.calls.pop();
		}
	};
}
