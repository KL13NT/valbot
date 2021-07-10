import { Command, CommandContext } from "../structures";
import { warn, isWarned } from "../utils/moderation";
import { log } from "../utils/general";
import ValClient from "../ValClient";

export default class Warn extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `warn`,
			category: "Moderation",
			cooldown: 1000,
			nOfParams: 2,
			description: `بتحذر ميمبر على حاجة عملها`,
			exampleUsage: `<user_mention> <reason>`,
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_MOD",
			},
		});
	}

	_run = async ({ member, message, channel, params }: CommandContext) => {
		const [mention, ...reasonWords] = params;
		const mentionRegex = /<@!(\d+)>/;

		try {
			if (!mentionRegex.test(mention)) {
				await message.reply("لازم تعمل منشن للـ member");
				return;
			}

			const id = mention.match(mentionRegex)[1];
			const reason = reasonWords.join(" ");

			if (isWarned(this.client, id)) {
				await message.reply("الميمبر ده متحذر قبل كده");
				return;
			}

			await warn(this.client, {
				member: id,
				moderator: member.id,
				channel: channel.id,
				reason,
			});
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
