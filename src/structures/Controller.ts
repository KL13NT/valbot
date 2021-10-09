import ValClient from "../ValClient";
import { ControllerOptions, Destroyable } from "../types/interfaces";

export default abstract class Controller implements Destroyable {
	client: ValClient;
	options: ControllerOptions;

	constructor(client: ValClient, options: ControllerOptions) {
		this.client = client;
		this.options = options;
	}

	abstract init(): Promise<void>;
	destroy = (): Promise<void> | void => undefined;
}
