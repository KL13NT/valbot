import ytdl from "ytdl-core";
import LRU from "lru-cache";
import stringSimilarity from "string-similarity";
import { TextChannel } from "discord.js";

import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import { MusicController } from "../controllers";

import { searchVideoMeta } from "../utils/youtube";
import { Song } from "../types/interfaces";
import PlayBehaviorEntity from "../Entities/PlayBehavior";

const YOUTUBE_URL = `https://www.youtube.com/watch?v=`;
const KEY_LENGTH = 100;
const MATCH_THRESHOLD = 0.8;

export default class Play extends Command {
	cache: LRU<string, Omit<Song, "requestingUserId" | "id">>;
	playEntity: PlayBehaviorEntity;
	constructor(client: ValClient) {
		super(client, {
			name: "play",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: "Start or continue playing a song",
			exampleUsage: "?<youtube_link|query>",
			extraParams: true,
			optionalParams: 1,
			aliases: ["p"],
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
			const voiceChannel = member.voice.channel;
			const textChannel = message.channel as TextChannel;
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			if (!voiceChannel) {
				await reply("User.VoiceNotConnected", message.channel);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("Command.Play.NotAllowed", message.channel);
				return;
			}

			if (params.length === 0) {
				await this.resume(controller, textChannel);
				return;
			}

			if (this.isInvalidLink(params[0])) {
				await reply("Command.Play.InvalidLink", message.channel);
				return;
			}

			/**
			 * A song has multiple possible values.
			 */
			const key = this.getKey(params);
			const cached = this.cache.get(key);

			if (cached === null) {
				await reply("Command.Play.NotFound", message.channel);
				return;
			}

			const matched = cached || this.getBestMatch(key);
			const song = matched || (await this.fetchAndCache(params));

			if (!song) {
				await reply("Command.Play.GenericError", message.channel);
				return;
			}

			const { url, title, duration, live, artist, name } = song;

			// cache a song by title when found, this improves search results as well
			// as the scenario where a song is played by link first then by a search query
			this.cache.set(title.substr(0, KEY_LENGTH), song);

			controller.enqueue({
				url,
				title,
				requestingUserId: member.id,
				duration,
				live,
				artist,
				name,
			});

			await reply("Command.Play.Queued", message.channel, {
				title,
				url,
				member,
			});

			await controller.connect(voiceChannel, textChannel);
			await controller.play();
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	resume = async (controller: MusicController, channel: TextChannel) => {
		const current = controller.getCurrentSong();
		const state = controller.playState;

		if (state === "paused") {
			controller.resume();
			await reply("Command.Play.Resumed", channel);
			return;
		}

		if (current) {
			await reply("Command.Play.AlreadyPlaying", channel);
			return;
		}

		await reply("Command.Play.NotPaused", channel);
	};

	getKey = (params: string[]) =>
		ytdl.validateURL(params[0])
			? ytdl.getURLVideoID(params[0])
			: params.join(" ").substr(0, KEY_LENGTH);

	isInvalidLink = (url: string) => {
		const regex = /^(https:?)|(www\.)|(youtu)/;

		return regex.test(url) && !ytdl.validateURL(url);
	};

	getBestMatch = (key: string) => {
		if (this.cache.keys().length === 0) return null;

		const { bestMatch } = stringSimilarity.findBestMatch(key, [
			...this.cache.keys(),
			"",
		]);

		if (bestMatch.rating > MATCH_THRESHOLD) {
			return this.cache.get(bestMatch.target);
		}

		return null;
	};

	fetchAndCache = async (params: string[]) => {
		const key = ytdl.validateURL(params[0])
			? ytdl.getURLVideoID(params[0])
			: params.join(" ").substr(0, KEY_LENGTH);

		try {
			const song = await this.fetchSongDetails(params);

			this.cache.set(key, song);

			return song;
		} catch (error) {
			log(this.client, error, "error");
			return null;
		}
	};

	getSongFromCache = (params: string[]) => {
		if (ytdl.validateURL(params[0])) {
			const id = ytdl.getURLVideoID(params[0]);

			return this.cache.get(id);
		} else {
			const query = params.join(" ").substr(0, KEY_LENGTH);

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

			const url = await this.getSongUrl(query);
			return this.getSongDetailsByUrl(url);
		}
	};

	/**
	 * @throws
	 */
	getSongDetailsByUrl = async (
		url: string,
	): Promise<Omit<Song, "requestingUserId" | "id">> => {
		try {
			const info = await ytdl.getBasicInfo(url);
			if (!info) return null;

			const { title, isLiveContent, lengthSeconds } = info.videoDetails;
			const { artist, song: name } = info?.videoDetails?.media;

			return {
				url,
				title,
				live: isLiveContent,
				duration: Number(lengthSeconds) * 1000,
				artist,
				name,
			};
		} catch (error) {
			if ((error as Error).message.includes("Video unavailable")) return null;
			else throw error;
		}
	};

	/**
	 * @throws
	 */
	getSongUrl = async (query: string): Promise<string> => {
		const { items } = await searchVideoMeta(query);

		if (items.length === 0) {
			return null;
		}

		const { videoId } = items[0].id;

		return `${YOUTUBE_URL}${videoId}`;
	};
}
