import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { IntervalOptions } from '../types/interfaces';

export default class IntervalsController extends Controller {
	ready = false;
	intervals: Map<string, NodeJS.Timeout>;

	constructor(client: ValClient) {
		super(client, {
			name: 'intervals'
		});

		this.ready = true;
		this.intervals = new Map<string, NodeJS.Timeout>();
	}

	setInterval(intervalOptions: IntervalOptions) {
		const { name, time, callback } = intervalOptions;

		if (this.exists(name)) this.clearInterval(name);

		this.intervals.set(name, setInterval(callback, time));
	}

	clearInterval(name: string) {
		clearInterval(this.intervals.get(name));
		this.intervals.delete(name);
	}

	exists(name: string) {
		return this.intervals.has(name);
	}
}
