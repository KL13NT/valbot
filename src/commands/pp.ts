import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";

export default class PP extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "pp",
			category: "Misc",
			cooldown: 1000,
			nOfParams: 1,
			description: "بتجيبلك pp اي حد",
			exampleUsage: "<user_mention>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_VERIFIED",
			},
		});
	}

	_run = async ({ message }: CommandContext) => {
		try {
			if (message.mentions.users.size === 0) {
				await message.reply("لازم تعمل منشن للـ member");
				return;
			}

			const avatarUrl = message.mentions.users.first().displayAvatarURL();

			await message.reply(`${avatarUrl}?4096`);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
