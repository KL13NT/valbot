import { Snowflake } from "discord.js";
import { resolve } from "path";
import { readFileSync } from "fs";

import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { log, capitalise, levelToExp } from "../utils/general";
import { getMemberObject } from "../utils/object";

import { RedisController, RenderController } from "../controllers";
import { getContentObject } from "../utils/svg";

const TEMPLATE: string = readFileSync(
	resolve(__dirname, "../../media/Frame 1.html"),
	"utf-8",
);

export default class Rank extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "rank",
			category: "Support",
			cooldown: 1000,
			nOfParams: 0,
			description: "بتشوف مستوى شخص ما",
			exampleUsage: "<user_id>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_VERIFIED",
			},
		});
	}

	_run = async ({ message, params, member }: CommandContext) => {
		const renderer = <RenderController>this.client.controllers.get("render");
		const [userMention] = params;
		const id = userMention
			? userMention.replace(/<|>|!|@/g, "")
			: member.user.id;

		try {
			if (id === this.client.user.id) {
				await message.reply("متكترش هزار عشان ميتعملش عليك صريخ ضحك :\"D");
				return;
			}

			const levelInfo = await this.getLevels(id);
			const userInfo = this.getUserInfo(id);
			const content = await getContentObject({ userInfo, levelInfo });

			const card = await renderer.render({ html: TEMPLATE, content });

			await message.reply("Here's the requested rank", {
				files: [
					{
						attachment: card,
					},
				],
			});
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	getUserInfo = (id: Snowflake) => {
		const target = getMemberObject(this.client, id);
		const MAX_NAME_LENGTH = 18;

		const avatarUrl = target.user.displayAvatarURL();
		const displayName = capitalise(
			target.displayName.substr(0, MAX_NAME_LENGTH).toLowerCase(),
		);

		return {
			avatarUrl,
			displayName:
				target.user.username.length > MAX_NAME_LENGTH
					? displayName + "..."
					: displayName,
		};
	};

	getLevels = async (id: Snowflake) => {
		const redis = <RedisController>this.client.controllers.get("redis");

		const [voice, text, exp, level] = await Promise.all([
			redis.get(`VOICE:${id}`),
			redis.get(`TEXT:${id}`),
			redis.get(`EXP:${id}`),
			redis.get(`LEVEL:${id}`),
		]);

		return {
			voice: Number(voice) || 1,
			text: Number(text) || 1,
			exp: Number(exp) || 1,
			level: Number(level) || 1,
			levelEXP: levelToExp(Number(level)),
		};
	};
}
