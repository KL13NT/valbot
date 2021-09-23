import Loader from "../structures/Loader";
import * as Controllers from "../controllers";

import { log } from "../utils/general";

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

			log(this.client, `${controllerInstance.options.name} loaded`, "info");
		}

		for (const controller of this.client.controllers.values()) {
			await controller.init();
			log(this.client, `${controller.options.name} initialized`, "info");
		}
	};
}
