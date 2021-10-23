import Transport from "winston-transport";
import fetch from "node-fetch";
import { createEmbed } from "../../utils/embed";

class DiscordWebhook extends Transport {
	constructor() {
		super({
			level: "error",
		});
	}

	log(info, callback) {
		const content = info.message;
		const payload = {
			embeds: [
				createEmbed({
					description: `${content.slice(0, 4096)}`,
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

const discordTransport = new DiscordWebhook();

export default discordTransport;
