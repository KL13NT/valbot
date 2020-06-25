import Loader from '../structures/Loader';
import * as Controllers from '../Controllers';
import ValClient from '../ValClient';

const { log } = require('../utils/general');

/**
 * Loads Controllers based on Controllers/index
 */
export default class ControllersLoader extends Loader {
	constructor(client: ValClient) {
		super(client);
	}

	load = () => {
		Object.values(Controllers).forEach(controller => {
			const controllerInstance = new controller(this.client);
			this.client.controllers.set(
				controllerInstance.options.name,
				controllerInstance
			);

			log(this.client, `${controller.options.name} loaded`, 'info');
		});
	};
}
