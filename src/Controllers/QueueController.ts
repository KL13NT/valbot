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

		this.ready = false;
		this.calls = [];
	}

	enqueue = (func: Function, ...args: any[]) => {
		this.calls.push({
			func,
			args
		});
	};

	executeAll = () => {
		for (let i = this.calls.length - 1; i >= 0; i--) {
			this.calls[i].func.apply(this, this.calls[i].args);
			this.calls.pop();
		}
	};
}
