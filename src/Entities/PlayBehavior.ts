import { Song } from "../types/interfaces";
import fetch from "node-fetch";

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
}

class YoutubeMix implements PlaylistRetriever {
	public fetchSongs(url: string) {
		return fetch(url)
			.then(res => res.text())
			.then(filterResponse)
			.then(this.parseResponse);
	}

	parseResponse = (response: string): Song[] => {
		const json = JSON.parse(response);
		const playlistItems =
			json.contents.twoColumnWatchNextResults.playlist.playlist.contents;

		if (!playlistItems) throw new Error("Invalid Playlist");

		return playlistItems.map(({ playlistPanelVideoRenderer }) =>
			this.parseItem(playlistPanelVideoRenderer),
		);
	};

	parseItem = (item: Record<string, any>): Omit<Song, "requestingUserId"> => {
		return {
			title: item?.title?.simpleText,
			duration: stringToTimestamp(item?.lengthText?.simpleText) * 1000,
			url: `https://www.youtube.com/watch?v=${item?.videoId}`,
			live: null,
		};
	};
}

class YoutubePL implements PlaylistRetriever {
	public fetchSongs(url: string) {
		return fetch(url)
			.then(res => res.text())
			.then(filterResponse)
			.then(this.parseResponse);
	}

	parseResponse = (response: string) => {
		const json = JSON.parse(response);
		const playlistItems =
			json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
				.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
				.playlistVideoListRenderer.contents;

		if (!playlistItems) throw new Error("Invalid Playlist");

		return playlistItems.map(({ playlistVideoRenderer }) =>
			this.parseItem(playlistVideoRenderer),
		);
	};

	parseItem = (item: Record<string, any>): Omit<Song, "requestingUserId"> => {
		return {
			title: item?.title?.runs[0]?.text,
			duration: Number(item?.lengthSeconds) * 1000,
			url: `https://www.youtube.com/watch?v=${item.videoId}`,
			live: null,
		};
	};
}

class PlayBehaviorEntity {
	private strategySelector = [
		{
			matcher: /^.*(youtu.be\/|list=RD)([^#\&\?]*).*/,
			strategy: new YoutubeMix(),
		},
		{
			matcher: /^.*(youtu.be\/|list=PL)([^#\&\?]*).*/,
			strategy: new YoutubePL(),
		},
	];

	public fetchSongs = (url: string): Promise<Song[]> => {
		const strategy = this.determineStrategy(url);
		if (!strategy)
			throw new Error("This is type of links is not supported yet.");
		return strategy.fetchSongs(url);
	};

	determineStrategy = (url: string): PlaylistRetriever => {
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
	.then(response => console.log(response));
