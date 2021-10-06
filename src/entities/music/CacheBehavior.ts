import LRUCache from "lru-cache";
import stringSimilarity from "string-similarity";
import { SINGLE_SYMBOL } from "./constants";

import { Key, PlaylistRetriever, Track, TrackRetriever } from "./types";

const MATCH_THRESHOLD = 0.8;

const options = {
	maxAge: 1000 * 60 * 60 * 24,
	max: 500,
	length: () => 1,
};

export default class CacheBehavior {
	// track key -> track
	private tracks = new LRUCache<Key, Track>(options);
	// playlist id -> track key
	private playlists = new LRUCache<Key, Key[]>(options);

	resolve = (strategy: PlaylistRetriever | TrackRetriever, key: Key) => {
		console.log(this.tracks, this.playlists);

		if (strategy.type === SINGLE_SYMBOL)
			return this.resolveTrack(key) || this.resolveBestMatchTrack(key);

		return this.resolvePlaylist(key);
	};

	resolveBestMatchTrack = (query: string) => {
		if (this.tracks.keys().length === 0) return null;

		const values = this.tracks.values();

		const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(
			query,
			[...values.map(track => track.title), ""],
		);

		if (bestMatch.rating > MATCH_THRESHOLD) return values[bestMatchIndex];
		return null;
	};

	resolveTrack = (key: Key) => this.tracks.get(key) || null;

	resolvePlaylist = (id: Key) => {
		const keys = this.playlists.get(id);
		if (!keys) return null;

		return keys.map(this.resolveTrack).filter(track => track);
	};

	addTrack = (key: Key, track: Track) => {
		this.tracks.set(key, track);
	};

	addPlaylist = (key: Key, playlist: Track[]) => {
		playlist.forEach(track => this.tracks.set(track.key, track));

		this.playlists.set(
			key,
			playlist.map(track => track.key),
		);
	};
}
