import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
// import { createEmbed } from "../utils/embed";
import { MusicController } from "../controllers";
import Pagination from "discord-paginationembed";
import { TextChannel } from "discord.js";
import { Song } from "../controllers/MusicController";

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

	_run = async ({ channel, author }: CommandContext) => {
		try {
			const { queue } = this.client.controllers.get("music") as MusicController;

			// const description =
			// 	queue.length === 0
			// 		? "The queue is empty."
			// 		: queue
			// 				.map((song, i) => `${i + 1}) [${song.title}](${song.url})`)
			// 				.join("\n");

			console.log(Pagination);
			const embed = new Pagination.FieldsEmbed()
				.setArray(queue.map(song => song.title))
				.setAuthorizedUsers([author.id])
				.setChannel(channel as TextChannel)
				.setElementsPerPage(10)
				.setPageIndicator(false)
				.formatField("title", song => `${(song as Song).title}`);

			embed.build();

			// TODO: paginate on long lists
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
