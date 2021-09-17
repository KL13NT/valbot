import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
// import { createEmbed } from "../utils/embed";
import { MusicController } from "../controllers";
import PaginatedEmbed from "../structures/PaginatedEmbed";
import { createEmbed } from "../utils/embed";
import { TextChannel } from "discord.js";

const PAGES = 2;

export default class Queue extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `queue`,
			category: "Music",
			cooldown: 10 * 1000,
			nOfParams: 0,
			description: `Lists songs in the queue`,
			exampleUsage: ``,
			extraParams: false,
			optionalParams: 0,
			aliases: ["q"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ channel, member }: CommandContext) => {
		try {
			const { queue } = this.client.controllers.get("music") as MusicController;

			const strings = queue.map(
				(song, i) => `${i}) ${song.title.substr(0, 40)}`,
			);

			const pages = [];
			for (let i = 0; i < queue.length; i += PAGES) {
				pages.push(
					createEmbed({
						description: `\`\`\`js\n${strings
							.slice(i, i + PAGES)
							.join("\n")}\`\`\``,
					}),
				);
			}

			console.log(pages);

			const paginatedEmbed = new PaginatedEmbed(
				channel as TextChannel,
				member,
				pages,
			);

			paginatedEmbed.init();

			// TODO: paginate on long lists
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
