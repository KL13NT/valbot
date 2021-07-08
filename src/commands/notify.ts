import { Command, CommandContext } from "../structures";
import { log, capitalise, awaitMessages } from "../utils/general";
import { getMemberObject } from "../utils/object";
import ValClient from "../ValClient";

import { MongoController, RedisController } from "../controllers";
import { Snowflake, TextChannel } from "discord.js";

export default class Notify extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "notify",
			category: "Management",
			cooldown: 1000,
			nOfParams: 0,
			description: "بتبعت اشعار برايفت لكل الناس اللي ف السيرفر",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async ({ guild, message, member }: CommandContext) => {
		try {
			const channel = <TextChannel>message.channel;
			await message.reply("ابعتلهم ايه؟");
			const collected = await awaitMessages(channel, member);

			await message.reply("ابعت بجد ولا تيستنج؟ [testing|prod]");
			const mode = await awaitMessages(channel, member);

			await message.reply("متأكد؟ [y|n]");
			const prompt = await awaitMessages(channel, member);

			if (prompt.toLowerCase() === "y") {
				const members =
					mode === "testing"
						? [message.member]
						: Array.from((await guild.members.fetch()).values());

				await message.reply("ببعت ناو");

				for (const member of members) {
					if (!member.user.bot)
						member
							.createDM()
							.then(dm => {
								return dm.send(collected);
							})
							.catch(() => console.log(`معرفتش ابعت لـ ${member.displayName}`));
				}
			} else {
				await message.reply("لغيت خلاص");
			}
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
		const mongo = <MongoController>this.client.controllers.get("mongo");
		const redis = <RedisController>this.client.controllers.get("redis");

		const res = await mongo.getLevel(id);

		const voice: number | string = res
			? res.voice
			: await redis.get(`VOICE:${id}`);
		const text: number | string = res
			? res.text
			: await redis.get(`TEXT:${id}`);

		const exp: number | string = await redis.get(`EXP:${id}`);
		const level: number | string = await redis.get(`LEVEL:${id}`);

		return {
			voice: Number(voice) || 1,
			text: Number(text) || 1,
			exp: Number(exp) || 1,
			level: Number(level) || 1,
			levelEXP: 60 * Number(level) * 0.1 + 60,
		};
	};
}
