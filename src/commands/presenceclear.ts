import { Command , CommandContext } from "../structures";
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
			this.client.presences = this.client.presences.filter(p => !p.priority);

			await this.client.setPresence();

			await message.reply("تم");
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
