import ValClient from '../ValClient';
import Listener from '../structures/Listener';

const { log } = require('../utils/general');

export default class ClientReadyListener extends Listener {
	constructor(client: ValClient) {
		super(client);

		this.events.set('ready', this.onReady);
	}

	onReady = (): void => {
		this.client.setPresence();

		this.client.ValGuild = this.client.guilds.cache.first();
		this.client.emit('queueExecute', 'Client ready');

		log(this.client, 'Client ready', 'info');
	};
}
