import btoa from "btoa";
import fetch from "node-fetch";
import ytdl from "ytdl-core";
import { Song } from "../types/interfaces";

type Track = Omit<Song, "requestingUserId" | "id">;

const filterResponse = (response: string) => {
	try {
		const regExp = /var ytInitialData = (.+?)<\/script>/im;
		const semicolon = /;$/;

		const matchResult = response.match(regExp);
		return matchResult[1].replace(semicolon, "");
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

const YOUTUBE_PLAYLIST_MATCHER = /^.*(youtu.be\/|list=)([^#&?]*).*/;
const SPOTIFY_PLAYLIST_MATCHER = /^https:\/\/open.spotify.com\/playlist\/([a-zA-Z0-9]+)\??/i;
const SPOTIFY_ALBUM_MATCHER = /^https:\/\/open.spotify.com\/album\/([a-zA-Z0-9]+)\??/i;
const SPOTIFY_SINGLE_MATCHER = /^https:\/\/open.spotify.com\/track\/([a-zA-Z0-9]+)\??/i;

const SPOTIFY_AUTH_URL =
	"https://accounts.spotify.com/api/token?grant_type=client_credentials";

interface SpotifyTrackResponse {
	id: string;
	name: string;
	artists: {
		name: string;
	}[];
	// eslint-disable-next-line camelcase
	duration_ms: number;
}

interface SpotifyAlbumResponse {
	items: SpotifyTrackResponse[];
}

interface SpotifyPlaylistResponse {
	items: {
		track: SpotifyTrackResponse;
	}[];
}

interface SpotifyAuthResponse {
	// eslint-disable-next-line camelcase
	access_token: string;
	// eslint-disable-next-line camelcase
	token_type: string;
	// eslint-disable-next-line camelcase
	expires_in: number;
}
class SpotifyAuth {
	private auth: SpotifyAuthResponse;
	private timestamp: number;

	setAuth = (auth: SpotifyAuthResponse) => {
		this.auth = auth;
	};

	setTimestamp = (timestamp: number) => {
		this.timestamp = timestamp;
	};

	public getAuth = async (): Promise<SpotifyAuthResponse> => {
		const currentTimestamp: number = new Date().getTime();

		if (
			!this.auth ||
			currentTimestamp - this.timestamp > this.auth.expires_in
		) {
			const auth = await this.generateAuth();
			this.setAuth(auth);
		}

		return this.auth;
	};

	private generateAuth = async (): Promise<SpotifyAuthResponse> => {
		try {
			const response = await fetch(SPOTIFY_AUTH_URL, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${btoa(
						`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`,
					)}`,
				},
				method: "POST",
			});

			if (!response.ok)
				throw new Error("Spotify Error: Failed to authenticate with spotify");

			return response.json();
		} catch (err) {
			console.log(err);
			throw err;
		}
	};
}

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

interface TrackRetriever {
	fetchSong(query: string): Promise<Track>;
}

class YoutubeTrack implements TrackRetriever {
	public fetchSong = async (query: string) => {
		const url = await this.getUrl(query);
		return this.getSongDetailsByUrl(url);
	};

	private getUrl = async (query: string) => {
		const searchUrl = this.prepareSearchQuery(query);
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

		const firstHit = hits[0].videoRenderer ?? hits[1].videoRenderer;

		if (typeof firstHit === "undefined") throw new Error("No results found");

		return `https://www.youtube.com/watch?v=${firstHit.videoId}`;
	};

	private prepareSearchQuery = (query: string): string => {
		const encodedQuery = encodeURIComponent(query);
		return `https://www.youtube.com/results?search_query=${encodedQuery}`;
	};

	private getSongDetailsByUrl = async (url: string): Promise<Track> => {
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
}

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

	parseItem = (item: YoutubeTrackResponse): Track => {
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

const parseTrack = (track: SpotifyTrackResponse): Track => {
	if (!track) throw new Error("The track is not found");

	const artists = track.artists.map(artist => artist.name);

	return {
		title: `${artists.join(" ")} - ${track.name}`,
		name: track.name,
		artist: artists.join(" "),
		url: `https://open.spotify.com/track/${track.id}`,
		duration: track.duration_ms,
		live: null,
	};
};

class SpotifyTrack implements TrackRetriever {
	private spotifyAuth: SpotifyAuth;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	fetchSong = async (url: string) => {
		const id = url.match(SPOTIFY_SINGLE_MATCHER)[1];
		// eslint-disable-next-line camelcase
		const { token_type, access_token } = await this.spotifyAuth.getAuth();

		return fetch(`https://api.spotify.com/v1/tracks/${id}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				// eslint-disable-next-line camelcase
				Authorization: `${token_type} ${access_token}`,
			},
		})
			.then(response => response.json())
			.then(parseTrack);
	};
}

class SpotifyPlaylist implements PlaylistRetriever {
	private spotifyAuth: SpotifyAuth;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	fetchSongs = async (url: string) => {
		const id = url.match(SPOTIFY_PLAYLIST_MATCHER)[1];
		// eslint-disable-next-line camelcase
		const { token_type, access_token } = await this.spotifyAuth.getAuth();

		return fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
			headers: {
				Accept: "application/json",
				// eslint-disable-next-line camelcase
				Authorization: `${token_type} ${access_token}`,
			},
		})
			.then(response => response.json())
			.then(this.parseResponse);
	};

	parseResponse = (response: SpotifyPlaylistResponse) => {
		return response.items.map(item => parseTrack(item.track));
	};
}

class SpotifyAlbum implements PlaylistRetriever {
	private spotifyAuth: SpotifyAuth;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	fetchSongs = async (url: string) => {
		const id = url.match(SPOTIFY_ALBUM_MATCHER)[1];

		try {
			const authorization = await this.spotifyAuth.getAuth();
			// eslint-disable-next-line camelcase
			const { token_type, access_token } = authorization;

			return fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, {
				headers: {
					Accept: "application/json",
					// eslint-disable-next-line camelcase
					Authorization: `${token_type} ${access_token}`,
				},
			})
				.then(response => response.json())
				.then(this.parseResponse);
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	parseResponse = (response?: SpotifyAlbumResponse): Track[] => {
		return response.items.map(item => parseTrack(item));
	};
}

export default class PlayBehaviorEntity {
	private spotifyAuth: SpotifyAuth = new SpotifyAuth();

	private playlistSelector = [
		{
			matcher: YOUTUBE_PLAYLIST_MATCHER,
			strategy: new YoutubePlaylist(),
		},
		{
			matcher: SPOTIFY_PLAYLIST_MATCHER,
			strategy: new SpotifyPlaylist(this.spotifyAuth),
		},
		{
			matcher: SPOTIFY_ALBUM_MATCHER,
			strategy: new SpotifyAlbum(this.spotifyAuth),
		},
	];

	private singleSelector = [
		{
			matcher: SPOTIFY_SINGLE_MATCHER,
			strategy: new SpotifyTrack(this.spotifyAuth),
		},
		{
			matcher: /.+/,
			strategy: new YoutubeTrack(),
		},
	];

	public fetchSongs = (url: string): Promise<Track[]> => {
		const strategy = this.determinePlaylistStrategy(url);

		if (!strategy) throw new Error("This link is not supported yet");
		return strategy.fetchSongs(url);
	};

	public fetchSong = (url: string): Promise<Track> => {
		const strategy = this.determineSingleStrategy(url);

		if (!strategy) throw new Error("This link is not supported yet");
		return strategy.fetchSong(url);
	};

	private determinePlaylistStrategy = (url: string): PlaylistRetriever => {
		const selected = this.playlistSelector.find(strategy =>
			strategy.matcher.test(url),
		);
		return selected ? selected.strategy : null;
	};

	private determineSingleStrategy = (url: string): TrackRetriever => {
		const selected = this.singleSelector.find(strategy =>
			strategy.matcher.test(url),
		);
		return selected ? selected.strategy : null;
	};
}
