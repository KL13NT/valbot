import Loader from "../structures/Loader";
import * as Controllers from "../controllers";

import logger from "../utils/logging";

/**
 * Loads Controllers based on Controllers/index
 */
export default class ControllersLoader extends Loader {
	load = async () => {
		for (const Controller of Object.values(Controllers)) {
			const controllerInstance = new Controller(this.client);

			this.client.controllers.set(
				controllerInstance.options.name,
				controllerInstance,
			);

			logger.info(`${controllerInstance.options.name} controller loaded`);
		}

		for (const controller of this.client.controllers.values()) {
			await controller.init();
			logger.info(`${controller.options.name} controller initialized`);
		}
	};
}
