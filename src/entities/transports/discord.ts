import Transport from "winston-transport";
import fetch from "node-fetch";
import { createEmbed } from "../../utils/embed";

class DiscordWebhook extends Transport {
	log(info, callback) {
		const content = String(info);
		const payload = {
			content: createEmbed({
				title: "Error",
				description: `${content.slice(0, 4096)}`,
			}),
		};

		fetch(process.env.DISCORD_HOOK_URL, {
			body: JSON.stringify(payload),
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
