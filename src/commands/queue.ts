import ValClient from "../ValClient";
import PaginatedEmbed from "../structures/PaginatedEmbed";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import { createEmbed } from "../utils/embed";
import { MusicController } from "../controllers";
import { TextChannel } from "discord.js";

const SONGS_PER_PAGE = 10;

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

			if (queue.length === 0) {
				channel.send(
					createEmbed({
						description: "The queue is empty.",
					}),
				);

				return;
			}

			const strings = queue.map(
				(song, i) => `${i + 1}) ${song.title.substr(0, 40)}`,
			);

			const pages = [];
			for (let i = 0; i < queue.length; i += SONGS_PER_PAGE) {
				pages.push(
					createEmbed({
						description: `${strings.slice(i, i + SONGS_PER_PAGE).join("\n")}`,
					}),
				);
			}

			const paginatedEmbed = new PaginatedEmbed(
				channel as TextChannel,
				member,
				pages,
			);

			await paginatedEmbed.init();
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
