import Loader from "../structures/Loader";
import * as Controllers from "../controllers";

import { log } from "../utils/general";

/**
 * Loads Controllers based on Controllers/index
 */
export default class ControllersLoader extends Loader {
	load = async () => {
		for (const controller of Object.values(Controllers)) {
			// eslint-disable-next-line new-cap
			const controllerInstance = new controller(this.client);

			this.client.controllers.set(
				controllerInstance.options.name,
				controllerInstance,
			);

			await controllerInstance.init();

			log(this.client, `${controller.name} loaded`, "info");
		}
	};
}
