import btoa from "btoa";
import fetch from "node-fetch";

import UserError from "../../structures/UserError";

import {
	PlaylistRetriever,
	PlayStrategySelector,
	Track,
	TrackRetriever,
} from "./types";

import {
	LIST_SYMBOL,
	SINGLE_SYMBOL,
	SPOTIFY_ALBUM_MATCHER,
	SPOTIFY_PLAYLIST_MATCHER,
	SPOTIFY_SINGLE_MATCHER,
} from "./constants";

interface SpotifyTrackResponse {
	id: string;
	name: string;
	artists: {
		name: string;
	}[];
	// eslint-disable-next-line camelcase
	duration_ms: number;
	error?: {
		status: number;
		message: string;
	};
}

interface SpotifyAlbumResponse {
	items: SpotifyTrackResponse[];
	error?: {
		status: number;
		message: string;
	};
}

interface SpotifyPlaylistResponse {
	items: {
		track: SpotifyTrackResponse;
	}[];
	next?: string;
	error?: {
		status: number;
		message: string;
	};
}

interface SpotifyAuthResponse {
	// eslint-disable-next-line camelcase
	access_token: string;
	// eslint-disable-next-line camelcase
	token_type: string;
	// eslint-disable-next-line camelcase
	expires_in: number;
}

const parseTrack = (response: SpotifyTrackResponse): Track => {
	if (response.error) {
		if (response.error.status === 404)
			throw new UserError("The track is not found");

		throw new Error(
			`Spotify Error [${response.error.status}]: ${response.error.message} `,
		);
	}

	const artists = response.artists.map(artist => artist.name);

	return {
		title: `${artists.join(" ")} - ${response.name}`,
		name: response.name,
		artist: artists.join(" "),
		url: `https://open.spotify.com/track/${response.id}`,
		duration: response.duration_ms,
		live: null,
		spotify: true,
		key: response.id,
	};
};

const SPOTIFY_AUTH_URL =
	"https://accounts.spotify.com/api/token?grant_type=client_credentials";

export class SpotifyAuth {
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

	/**
	 *
	 * @throws
	 */
	private generateAuth = async (): Promise<SpotifyAuthResponse> => {
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
			throw new Error(
				`Spotify Error ${response.status}: Failed to authenticate with spotify`,
			);

		return response.json();
	};
}

export class SpotifyTrack implements TrackRetriever {
	private spotifyAuth: SpotifyAuth;
	public type = SINGLE_SYMBOL;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	generateKey = (query: string) => {
		return query.match(SPOTIFY_SINGLE_MATCHER)[1];
	};

	fetch = async (url: string) => {
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

export class SpotifyPlaylist implements PlaylistRetriever {
	private spotifyAuth: SpotifyAuth;
	public type = LIST_SYMBOL;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	generateKey = (query: string) => {
		return query.match(SPOTIFY_PLAYLIST_MATCHER)[1];
	};

	private next = (URL: string, token: string, tracks: Track[] = []) => {
		return fetch(URL, {
			headers: {
				Accept: "application/json",
				// eslint-disable-next-line camelcase
				Authorization: token,
			},
		})
			.then(response => response.json())
			.then(this.parseResponse)
			.then(data => {
				const response = [...tracks, ...data.tracks];
				if (data.next) return this.next(data.next, token, response);
				return response;
			});
	};

	fetch = async (url: string) => {
		const id = url.match(SPOTIFY_PLAYLIST_MATCHER)[1];
		const URL = `https://api.spotify.com/v1/playlists/${id}/tracks`;
		// eslint-disable-next-line camelcase
		const { token_type, access_token } = await this.spotifyAuth.getAuth();
		// eslint-disable-next-line camelcase
		const token = `${token_type} ${access_token}`;

		return this.next(URL, token, []);
	};

	parseResponse = (response: SpotifyPlaylistResponse) => {
		if (response.error)
			throw new Error(
				`Spotify Error [${response.error.status}]: ${response.error.message} `,
			);

		return {
			tracks: response.items.map(item => parseTrack(item.track)),
			next: response.next,
		};
	};
}

export class SpotifyAlbum implements PlaylistRetriever {
	private spotifyAuth: SpotifyAuth;
	public type = LIST_SYMBOL;

	constructor(spotifyAuth: SpotifyAuth) {
		this.spotifyAuth = spotifyAuth;
	}

	generateKey = (query: string) => {
		return query.match(SPOTIFY_ALBUM_MATCHER)[1];
	};

	fetch = async (url: string) => {
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
		if (response.error)
			throw new Error(
				`Spotify Error [${response.error.status}]: ${response.error.message} `,
			);

		return response.items.map(item => parseTrack(item));
	};
}

export class SpotifyStrategySelector implements PlayStrategySelector {
	private spotifyAuth: SpotifyAuth = new SpotifyAuth();
	private options = [
		{
			matcher: SPOTIFY_PLAYLIST_MATCHER,
			strategy: new SpotifyPlaylist(this.spotifyAuth),
		},
		{
			matcher: SPOTIFY_ALBUM_MATCHER,
			strategy: new SpotifyAlbum(this.spotifyAuth),
		},
		{
			matcher: SPOTIFY_SINGLE_MATCHER,
			strategy: new SpotifyTrack(this.spotifyAuth),
		},
	];

	select = (url: string) => {
		const selected = this.options.find(strategy => strategy.matcher.test(url));
		return selected ? selected.strategy : null;
	};
}
