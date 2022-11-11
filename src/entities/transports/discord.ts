import Transport from "winston-transport";
import fetch from "node-fetch";
import { createEmbed } from "../../utils/embed";

const MAX_BODY_LENGTH = 4096;

class DiscordWebhook extends Transport {
	constructor() {
		super({
			level: "error",
		});
	}

	log(info, callback) {
		if (process.env.MODE === "DEVELOPMENT") return;

		const content = info.message;
		const payload = {
			embeds: [
				createEmbed({
					description: `${content.slice(0, MAX_BODY_LENGTH)}`,
				}),
			],
		};

		fetch(process.env.DISCORD_HOOK_URL, {
			body: JSON.stringify(payload),
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		})
			.then(() => {
				this.emit("logged", info);
				callback();
			})
			.catch(err => {
				this.emit("error", err);
				callback();
			});
	}
}

export default new DiscordWebhook();
