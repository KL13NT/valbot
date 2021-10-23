import ValClient from "../ValClient";

import logger from "../utils/logging";
import { Command, CommandContext } from "../structures";
import { IntervalsController } from "../controllers";

export default class Debug extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `debug`,
			category: "Development",
			cooldown: 1000,
			nOfParams: 1,
			description: `بتوريك الاداء بتاع البوت و معلومات عن البروسيس بتاعه`,
			exampleUsage: `<"on"|"off">`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_DEV",
				devOnly: true,
			},
		});
	}

	_run = async (context: CommandContext) => {
		const { message, params } = context;

		if (params[0] !== "on" && params[0] !== "off") {
			await message.reply("اول باراميتر المفروض يبقى on او off");
			return;
		}

		if (params[0] === "on") {
			await this.start(context);
			return;
		}

		await this.stop(context);
	};

	start = async ({ message }: CommandContext) => {
		const intervals = <IntervalsController>(
			this.client.controllers.get("intervals")
		);

		const { CHANNEL_BOT_STATUS } = this.client.config;

		if (intervals.exists("debug")) {
			await message.reply("انا مشغل الdebugger اصلا يبشا");
			return;
		}

		await message.reply(
			`I'll report on the dev channel <#${CHANNEL_BOT_STATUS}>`,
		);

		logger.info("Logging every 2000ms");
		intervals.set({
			time: 2000,
			name: "debug",
			callback: () => {
				logger.info(this.usageToString());
			},
		});
	};

	stop = async ({ message }: CommandContext) => {
		const intervals = <IntervalsController>(
			this.client.controllers.get("intervals")
		);

		if (!intervals.exists("debug")) {
			await message.reply("انا مش مشغل الdebugger اصلا يبشا");
			return;
		}

		await message.reply(`قفلت الـ debugger خلاص`);

		logger.info("Logger disabled");
		intervals.clear("debug");
	};

	usageToString = () => {
		const { heapTotal, heapUsed } = process.memoryUsage();
		const { argv } = process;

		return `
		ValBot NodeJS Process Debug Info
		--------------------------------
		Total heap: used ${heapUsed / 1024 / 1024} / ${heapTotal / 1024 / 1024}
		Process arguments: ${argv.join(", ")}
		`;
	};
}
