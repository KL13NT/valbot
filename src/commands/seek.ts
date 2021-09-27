import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { log, reply } from "../utils/general";

export default class Seek extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "seek",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: "Seek to position in seconds.",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message, params }: CommandContext) => {
		try {
			// TODO
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
