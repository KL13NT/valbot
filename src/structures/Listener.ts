import ValClient from "../ValClient";

import { capitalise } from "../utils/general";

export default class Listener {
	[index: string]: any; //eslint-disable-line
	client: ValClient;
	events: string[];

	constructor(client: ValClient, events: string[]) {
		this.client = client;
		this.events = events;
	}

	init = (): void => {
		this.events.forEach(event => {
			this.client.on(event, this[`on${capitalise(event)}`]);
		});
	};
}
