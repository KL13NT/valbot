import { Command, CommandContext } from "../structures";
import ValClient from "../ValClient";

import { MongoController } from "../controllers";
import { createEmbed } from "../utils/embed";
import { Level } from "../types/interfaces";
// import { getMemberObject } from '../utils/object';

export default class Leaderboard extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "leaderboard",
			category: "Support",
			cooldown: 1000,
			nOfParams: 0,
			description: "بتشوف مستوى اول عشر أشخاص",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_VERIFIED",
			},
		});
	}

	generateLevelString = ({ id, level }: Level, { member }: CommandContext) => {
		const yours = id === member.id ? ":star: **Your position**" : "";
		return `Level **${String(level).padStart(2, "0")}** — <@${id}> ${yours}`;
	};

	_run = async (ctx: CommandContext) => {
		const { message, member } = ctx;
		const mongo = <MongoController>this.client.controllers.get("mongo");

		const levels: Level[] = await mongo.db
			.collection("levels")
			.find({})
			.limit(20)
			.sort({ level: -1 })
			.toArray();

		const yours = await mongo.db
			.collection("levels")
			.findOne({ id: member.id });

		const descriptions = levels.map(lvl => this.generateLevelString(lvl, ctx));

		if (!levels.some(l => l.id === member.id)) {
			descriptions.push(`\n${this.generateLevelString(yours, ctx)}`);
		}

		const embed = createEmbed({
			title: "Top 20 Active Members",
			description: descriptions.join("\n"),
			footer: { text: "For full rank details use `v! rank`" },
		});

		await message.reply({ embeds: [embed] });
	};
}
