import ValClient from '../ValClient';

export default abstract class Loader {
	client: ValClient;

	constructor(client: ValClient) {
		this.client = client;
	}

	/**
	 * Defines load behaviour for this listener
	 * @async
	 * @virtual
	 */
	abstract load(): Promise<void>;
}
