import ValClient from '../ValClient';
import { ListenerHandler } from '../types/interfaces';

export default class Listener {
	client: ValClient;
	events: Map<string, ListenerHandler>;

	constructor(client: ValClient, events: Map<string, ListenerHandler>) {
		this.client = client;
		this.events = events;
	}

	init = (): void => {
		this.events.forEach((handler, event) => {
			this.client.on(event, handler);
		});
	};
}
