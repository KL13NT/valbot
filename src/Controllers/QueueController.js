const { Controller } = require('../structures');

/**
 * @global
 */
export default class QueueController extends Controller {
	constructor(client) {
		super(client, {
			name: 'queue'
		});

		this.ready = false;
		this.calls = [];

		this.enqueue = this.enqueue.bind(this);
		this.executeAll = this.executeAll.bind(this);
	}

	enqueue(func, ...args) {
		this.calls.push({
			func,
			args
		});
	}

	executeAll() {
		for (let i = this.calls.length - 1; i >= 0; i--) {
			this.calls[i].func.apply(this, this.calls[i].args);
			this.calls.pop();
		}
	}
}
