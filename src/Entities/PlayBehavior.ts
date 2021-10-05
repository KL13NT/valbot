import fetch from "node-fetch";
import { Song } from "../types/interfaces";

type Track = Omit<Song, "requestingUserId" | "id">;

const YOUTUBE_PLAYLIST_MATCHER = /^.*(youtu.be\/|list=)([^#&?]*).*/;

interface YoutubeTrack {
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
					contents: YoutubeTrack[];
				};
			};
		};
	};
}

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
	fetchSongs(url: string): Promise<Track[]>;
}

class YoutubePlaylist implements PlaylistRetriever {
	fetchSongs = async (url: string) => {
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

	parseResponse = (response: string) => {
		const json: YoutubePlaylistResponse = JSON.parse(response);

		const playlistItems =
			json.contents.twoColumnWatchNextResults.playlist.playlist.contents;

		if (!playlistItems)
			throw new Error("The playlist is either empty or not found");

		return playlistItems
			.filter(item => typeof item.playlistPanelVideoRenderer !== "undefined")
			.map(item => this.parseItem(item));
	};

	parseItem = (item: YoutubeTrack): Track => {
		return {
			title: item.playlistPanelVideoRenderer.title.simpleText,
			duration:
				stringToTimestamp(
					item.playlistPanelVideoRenderer.lengthText.simpleText,
				) * 1000,
			url: `https://www.youtube.com/watch?v=${item.playlistPanelVideoRenderer.videoId}`,
			live: null,
			name: null,
			artist: null,
		};
	};
}

export default class PlayBehaviorEntity {
	private playlistSelector = [
		{
			matcher: YOUTUBE_PLAYLIST_MATCHER,
			strategy: new YoutubePlaylist(),
		},
	];

	public fetchSongs = (url: string): Promise<Track[]> => {
		const strategy = this.determinePlaylistStrategy(url);

		if (!strategy) throw new Error("This link is not supported yet");
		return strategy.fetchSongs(url);
	};

	private determinePlaylistStrategy = (url: string): PlaylistRetriever => {
		const selected = this.playlistSelector.find(strategy =>
			strategy.matcher.test(url),
		);
		return selected ? selected.strategy : null;
	};
}
