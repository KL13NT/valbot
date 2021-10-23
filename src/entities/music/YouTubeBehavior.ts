import ytdl from "ytdl-core";
import fetch from "node-fetch";

import UserError from "../../structures/UserError";
import { stringToTimestamp } from "../../utils/general";

import {
	Key,
	Matcher,
	PlaylistRetriever,
	PlayStrategySelector,
	Track,
	TrackRetriever,
} from "./types";

import {
	YOUTUBE_PLAYLIST_MATCHER,
	SINGLE_SYMBOL,
	LIST_SYMBOL,
	YOUTUBE_SEARCH_SINGLE_MATCHER,
} from "./constants";
import { retryRequest } from "../../utils/apis";

interface YoutubeTrackResponse {
	playlistPanelVideoRenderer: {
		title: {
			simpleText: string;
		};
		lengthText: {
			simpleText: string;
		};
		videoId: string;
	};
}

interface YoutubePlaylistResponse {
	contents: {
		twoColumnWatchNextResults: {
			playlist?: {
				playlist: {
					contents: YoutubeTrackResponse[];
				};
			};
		};
	};
}

const filterResponse = (response: string) => {
	try {
		const regExp = /var ytInitialData = (.+?)<\/script>/im;
		const semicolon = /;$/;

		const matchResult = response.match(regExp);
		return matchResult[1].replace(semicolon, "");
	} catch {
		throw new Error("Error while filtering response");
	}
};

export class YoutubeTrack implements TrackRetriever {
	public type = SINGLE_SYMBOL;

	public fetch = async (query: string) => {
		const url = ytdl.validateURL(query) ? query : await this.getUrl(query);
		return retryRequest(() => this.getSongDetailsByUrl(url));
	};

	public generateKey = (query: string) => {
		return ytdl.validateURL(query) ? ytdl.getURLVideoID(query) : query;
	};

	private getUrl = async (query: string) => {
		const searchUrl = this.prepareSearchQuery(`${query} lyrics`);
		return fetch(searchUrl)
			.then(response => response.text())
			.then(filterResponse)
			.then(this.parseResponse);
	};

	private parseResponse = (response: string) => {
		const json = JSON.parse(response);
		const hits =
			json.contents.twoColumnSearchResultsRenderer.primaryContents
				.sectionListRenderer.contents[0]?.itemSectionRenderer?.contents;

		const firstHit = hits[0]?.videoRenderer ?? hits[1]?.videoRenderer;

		if (typeof firstHit === "undefined")
			throw new UserError("No results found");

		return `https://www.youtube.com/watch?v=${firstHit.videoId}`;
	};

	private prepareSearchQuery = (query: string): string => {
		const encodedQuery = encodeURIComponent(query);
		return `https://www.youtube.com/results?search_query=${encodedQuery}`;
	};

	private getSongDetailsByUrl = async (url: string): Promise<Track> => {
		const info = await ytdl.getBasicInfo(url, {
			requestOptions: {
				headers: {
					cookie: process.env.COOKIE,
				},
			},
		});

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
			key: info.videoDetails.videoId,
			spotify: false,
		};
	};
}

export class YoutubePlaylist implements PlaylistRetriever {
	public type = LIST_SYMBOL;

	fetch = async (url: string) => {
		const conformedUrl = this.conform(url);

		return fetch(conformedUrl)
			.then(res => res.text())
			.then(filterResponse)
			.then(this.parseResponse);
	};

	conform = (url: string) => {
		const playlistId = url.match(YOUTUBE_PLAYLIST_MATCHER)[1];
		return `https://www.youtube.com/watch?v=1&list=${playlistId}`;
	};

	generateKey = (url: Key) => {
		const playlistId = url.match(YOUTUBE_PLAYLIST_MATCHER)[1];
		return playlistId;
	};

	parseResponse = (response: string) => {
		const json: YoutubePlaylistResponse = JSON.parse(response);

		const playlistItems =
			json.contents.twoColumnWatchNextResults?.playlist?.playlist?.contents;

		if (!playlistItems)
			throw new UserError("The playlist is either empty or not found");

		return playlistItems
			.filter(item => typeof item.playlistPanelVideoRenderer !== "undefined")
			.map(item => this.parseItem(item));
	};

	parseItem = (item: YoutubeTrackResponse): Track => {
		const duration =
			stringToTimestamp(item.playlistPanelVideoRenderer.lengthText.simpleText) *
			1000;
		return {
			title: item.playlistPanelVideoRenderer.title.simpleText,
			duration,
			url: `https://www.youtube.com/watch?v=${item.playlistPanelVideoRenderer.videoId}`,
			live: null,
			name: null,
			artist: null,
			spotify: false,
			key: item.playlistPanelVideoRenderer.videoId,
		};
	};
}

export class YoutubeStrategySelector implements PlayStrategySelector {
	private options: Matcher[];

	constructor() {
		this.options = [
			{
				matcher: YOUTUBE_PLAYLIST_MATCHER,
				strategy: new YoutubePlaylist(),
			},
			{
				matcher: YOUTUBE_SEARCH_SINGLE_MATCHER,
				strategy: new YoutubeTrack(),
			},
		];
	}

	select = (url: string) => {
		const selected = this.options.find(strategy => strategy.matcher.test(url));
		return selected ? selected.strategy : null;
	};
}
