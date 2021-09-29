import { PresenceController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import ValClient from "../ValClient";

export default class PresenceClear extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "presenceclear",
			category: "Management",
			cooldown: 1000,
			nOfParams: 0,
			description: "بتشيل اي jit presence معمول",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async ({ message }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"presence",
			) as PresenceController;

			await controller.clearPriority();

			await message.reply("تم");
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
