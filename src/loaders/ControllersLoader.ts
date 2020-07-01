import Loader from '../structures/Loader';
import * as Controllers from '../controllers';
import ValClient from '../ValClient';

import { log } from '../utils/general';

/**
 * Loads Controllers based on Controllers/index
 */
export default class ControllersLoader extends Loader {
	constructor(client: ValClient) {
		super(client);
	}

	load = async () => {
		for (const controller of Object.values(Controllers)) {
			const controllerInstance = new controller(this.client);

			this.client.controllers.set(
				controllerInstance.options.name,
				controllerInstance
			);

			await controllerInstance.init();

			log(this.client, `${controller.name} loaded`, 'info');
		}
	};
}
