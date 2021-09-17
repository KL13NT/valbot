import ytdl from "ytdl-core";
import { TextChannel } from "discord.js";
import { decode } from "html-entities";

import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import { MusicController } from "../controllers";

import { createEmbed } from "../utils/embed";
import { searchVideoMeta } from "../utils/youtube";
import { Song } from "../controllers/MusicController";
import LRU from "lru-cache";

const YOUTUBE_URL = `https://www.youtube.com/watch?v=`;

export default class Play extends Command {
	cache: LRU<string, Omit<Song, "requestingUserId"> | null>;

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

			let song: Omit<Song, "requestingUserId"> =
				this.cache.get(params[0]) || this.cache.get(params.join(" "));

			if (song)
				await log(
					this.client,
					`Song available in cache. Params ${params}`,
					"info",
				);

			if (song === undefined) {
				await log(
					this.client,
					`Song is not available in cache. Params: ${params}`,
					"info",
				);

				if (ytdl.validateURL(params[0]) || /https?:/.test(params[0]))
					song = await this.getSongDetailsByUrl(params[0]);
				else song = await this.getSongDetailsByQuery(params.join(" "));
			}

			if (!song) {
				await log(this.client, `Couldn't find song. Params: ${params}`, "info");

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

	getSongDetailsByUrl = async (
		url: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		try {
			const { title } = (await ytdl.getBasicInfo(url)).videoDetails;

			this.cache.set(url, {
				url,
				title,
			});

			return {
				url,
				title,
			};
		} catch (error) {
			await log(this.client, error, "error");
			this.cache.set(url, null);

			return null;
		}
	};

	getSongDetailsByQuery = async (
		query: string,
	): Promise<Omit<Song, "requestingUserId">> => {
		try {
			const { items } = await searchVideoMeta(query);

			if (items.length === 0) {
				this.cache.set(query, null);
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
		} catch (error) {
			await log(this.client, error, "error");
			return null;
		}
	};
}
