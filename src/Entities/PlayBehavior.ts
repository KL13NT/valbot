import { Song } from "../types/interfaces";
import fetch from "node-fetch";

const YOUTUBE_PLAYLIST_MATCHER = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;

const filterResponse = (response: string) => {
	try {
		const regExp = /var ytInitialData = (.+?)<\/script>/im;
		const semiColon = /;$/;

		const matchResult = response.match(regExp);
		return matchResult[1].replace(semiColon, "");
	} catch (err) {
		throw Error("Error while filtering response");
	}
};

const stringToTimestamp = (time: string) => {
	if (!time) return undefined;

	return time
		.split(":")
		.map(period => Number(period))
		.reduce((accumulator, period) => 60 * accumulator + period, 0);
};

interface PlaylistRetriever {
	fetchSongs(url: string): Promise<Song[]>;
	conform(url: string): string;
}

class YoutubePlaylist implements PlaylistRetriever {
	fetchSongs = (url: string) => {
		const conformedUrl = this.conform(url);

		return fetch(conformedUrl)
			.then(res => res.text())
			.then(filterResponse)
			.then(this.parseResponse);
	};

	conform = (url: string) => {
		const playlistId = url.match(YOUTUBE_PLAYLIST_MATCHER)[2];
		return `https://www.youtube.com/watch?v=1&list=${playlistId}`;
	};

	parseResponse = (response: string): Song[] => {
		const json = JSON.parse(response);
		const playlistItems =
			json.contents.twoColumnWatchNextResults?.playlist?.playlist?.contents;

		if (!playlistItems)
			throw new Error("The playlist is either empty or not found");

		return playlistItems
			.filter(item => typeof item.playlistPanelVideoRenderer !== "undefined")
			.map(item => this.parseItem(item.playlistPanelVideoRenderer));
	};

	parseItem = (item: Record<string, any>): Omit<Song, "requestingUserId"> => {
		return {
			title: item.title.simpleText,
			duration: stringToTimestamp(item.lengthText.simpleText) * 1000,
			url: `https://www.youtube.com/watch?v=${item.videoId}`,
			live: null,
		};
	};
}

class PlayBehaviorEntity {
	private strategySelector = [
		{
			matcher: YOUTUBE_PLAYLIST_MATCHER,
			strategy: new YoutubePlaylist(),
		},
	];

	public fetchSongs = (url: string): Promise<Song[]> => {
		const strategy = this.determineStrategy(url);

		if (!strategy) throw new Error("This link is not supported yet");

		return strategy.fetchSongs(url);
	};

	private determineStrategy = (url: string): PlaylistRetriever => {
		const selected = this.strategySelector.find(strategy =>
			strategy.matcher.test(url),
		);
		return selected ? selected.strategy : null;
	};
}

const playEntity = new PlayBehaviorEntity();
playEntity
	.fetchSongs(
		"https://www.youtube.com/playlist?list=PLd_7Ide8yuofr-DJjFYiO076eRW2yL4V7",
	)
	.then(response => response.forEach(song => console.log(song)));
