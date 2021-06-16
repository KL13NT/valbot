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
			optionalParams: 1,
			auth: {
				method: "ROLE",
				required: "AUTH_VERIFIED",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
		try {
			const target =
				message.mentions.users.size === 0
					? member.user
					: message.mentions.users.first();

			const avatarUrl = target.displayAvatarURL({ dynamic: true, size: 4096 });

			await message.reply(avatarUrl);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
