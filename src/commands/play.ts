import ytdl from "ytdl-core";
import LRU from "lru-cache";
import { TextChannel } from "discord.js";
import { decode } from "html-entities";

import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import { MusicController } from "../controllers";

import { createEmbed } from "../utils/embed";
import { searchVideoMeta } from "../utils/youtube";
import { Song } from "../controllers/MusicController";

const YOUTUBE_URL = `https://www.youtube.com/watch?v=`;

export default class Play extends Command {
	cache: LRU<string, Omit<Song, "requestingUserId">>;

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

		this.cache = new LRU({
			maxAge: 1000 * 60 * 60 * 24,
			max: 500,
			length: () => 1,
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

			const regex = /^(https:?)|(www\.)|(youtu)/;
			const key = ytdl.validateURL(params[0])
				? ytdl.getURLVideoID(params[0])
				: params.join(" ");

			if (regex.test(params[0]) && !ytdl.validateURL(params[0])) {
				message.channel.send(
					createEmbed({
						description: "This link is invalid. Try a different one.",
					}),
				);

				return;
			}

			let song = this.cache.get(key);

			if (!song) {
				await log(
					this.client,
					`Song is not in the cache. Fetching instead. [${key}]`,
					"info",
				);

				song = await this.fetchAndCache(params);
			} else {
				await log(this.client, `Song is in the cache. [${key}]`, "info");
			}

			if (!song) {
				await message.channel.send(
					createEmbed({
						description:
							"Could't find a video matching this query. It might be restricted, or the search quota might have been depleted. If you're sure this video exists try using a link instead.",
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
			await log(this.client, err, "error");
		}
	};

	fetchAndCache = async (params: string[]) => {
		try {
			const song = await this.fetchSongDetails(params);
			const key = ytdl.validateURL(params[0])
				? ytdl.getURLVideoID(params[0])
				: params.join(" ");

			if (song) this.cache.set(key, song);

			return song;
		} catch (error) {
			return null;
		}
	};

	getSongFromCache = (params: string[]) => {
		if (ytdl.validateURL(params[0])) {
			const id = ytdl.getURLVideoID(params[0]);

			return this.cache.get(id);
		} else {
			const query = params.join(" ");

			return this.cache.get(query);
		}
	};

	/**
	 * @throws
	 */
	fetchSongDetails = async (params: string[]) => {
		if (ytdl.validateURL(params[0])) {
			return this.getSongDetailsByUrl(params[0]);
		} else {
			const query = params.join(" ");

			return this.getSongDetailsByQuery(query);
		}
	};

	/**
	 * @throws
	 */
	getSongDetailsByUrl = async (
		url: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		const info = await ytdl.getBasicInfo(url);

		if (!info) return null;

		const { title } = info.videoDetails;

		return {
			url,
			title,
		};
	};

	/**
	 * @throws
	 */
	getSongDetailsByQuery = async (
		query: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		const { items } = await searchVideoMeta(query);

		if (items.length === 0) {
			return null;
		}

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
