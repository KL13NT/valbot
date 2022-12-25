import ValClient from "../ValClient";
import PaginatedEmbed from "../structures/PaginatedEmbed";

import { Command, CommandContext } from "../structures";
import { createEmbed } from "../utils/embed";
import { MusicController } from "../controllers";
import { TextChannel } from "discord.js";

const SONGS_PER_PAGE = 10;

export default class Queue extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `queue`,
			category: "Music",
			cooldown: 5 * 1000,
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
		const controller = this.client.controllers.get("music") as MusicController;

		if (controller.queue.length === 0) {
			channel.send({
				embeds: [
					createEmbed({
						description: "The queue is empty.",
					}),
				],
			});

			return;
		}

		const strings = controller.queue.map((song, i) => {
			const encoded = song.title.substr(0, 40).replace(/(\]|\[)/, "\\$1");
			const title = `[${encoded}](${song.url})`;
			const user = `<@!${song.requestingUserId}>`;
			const playing = i === controller.currentSongIndex ? "▶️" : "";

			return `**${i + 1})** ${title} | ${user} ${playing}\n`;
		});

		const pages = [];
		const current = controller.getCurrentSong();
		const title =
			controller.playState === "playing"
				? `**__Playing  ▶️__**\n**${controller.currentSongIndex + 1})** [${
						current.title
				  }](${current.url}) [<@!${current.requestingUserId}>]`
				: `**__Stopped  ⏸️__**`;

		const loop = `Loop: ${controller.loopState}`;
		const songs = `${controller.queue.length} songs in queue`;

		for (let i = 0; i < controller.queue.length; i += SONGS_PER_PAGE) {
			const list = strings.slice(i, i + SONGS_PER_PAGE).join("\n");
			const queue = `**__Queue__**\n${list}`;
			const page = `${title}\n\n${queue}\n\n**${songs} | ${loop}**`;

			pages.push(
				createEmbed({
					description: page,
				}),
			);
		}

		const paginatedEmbed = new PaginatedEmbed(
			channel as TextChannel,
			member,
			pages,
		);

		await paginatedEmbed.init();
	};
}
