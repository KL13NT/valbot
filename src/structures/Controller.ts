import ValClient from '../ValClient';
import { ControllerOptions } from '../types/interfaces';

export default class Controller {
	client: ValClient;
	options: ControllerOptions;

	constructor(client: ValClient, options: ControllerOptions) {
		this.client = client;
		this.options = options;
	}
}
