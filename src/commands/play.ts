import ytdl from "ytdl-core";
import { TextChannel } from "discord.js";
import { decode } from "html-entities";

import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import { MusicController } from "../controllers";

import { createEmbed } from "../utils/embed";
import { fetchVideoMeta, searchVideoMeta } from "../utils/youtube";
import { Song } from "../controllers/MusicController";

const YOUTUBE_URL = `https://www.youtube.com/watch?v=`;

export default class Play extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "play",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: "احلى اغنية دي ولا ايه",
			exampleUsage: "<youtube_link|query>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message, params }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			const textChannel = message.channel as TextChannel;
			const voiceChannel = member.voice.channel;

			if (!voiceChannel) {
				await message.reply(
					createEmbed({
						description: `You're not connected to a voice channel`,
					}),
				);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await message.reply(
					createEmbed({
						description: "You must be in the same channel as the bot",
					}),
				);
				return;
			}

			let song: Omit<Song, "requestingUserId">;

			if (ytdl.validateURL(params[0]))
				song = await this.getSongDetailsByUrl(params[0]);
			else song = await this.getSongDetailsByQuery(params.join(" "));

			if (!song) {
				await message.channel.send(
					createEmbed({
						description:
							"Could't find a video matching this query. It might be restricted. Try a different one.",
					}),
				);
				return;
			}

			const { url, title } = song;
			controller.enqueue({
				url,
				title,
				requestingUserId: member.id,
			});

			await message.channel.send(
				createEmbed({
					description: `Queued [${decode(title)}](${url}) [${member}]`,
				}),
			);

			await controller.connect(voiceChannel, textChannel);
			await controller.play();
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	getSongDetailsByUrl = async (
		url: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		const id = ytdl.getURLVideoID(url);
		const { items } = await fetchVideoMeta(id);

		if (items.length === 0) return null;

		const { snippet } = items[0];
		const { title } = snippet;

		return {
			url,
			title,
		};
	};

	getSongDetailsByQuery = async (
		query: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		const { items } = await searchVideoMeta(query);

		if (items.length === 0) return null;

		const { snippet, id } = items[0];
		const { videoId } = id;
		const { title } = snippet;
		const url = `${YOUTUBE_URL}${videoId}`;

		return {
			url,
			title,
		};
	};
}
