import { Song } from "../../types/interfaces";

export type Track = Omit<Song, "requestingUserId" | "id">;
export type Key = string;

export interface TrackRetriever {
	readonly type: symbol;
	fetch(query: string): Promise<Track>;
	generateKey(query: string): Key;
}

export interface PlaylistRetriever {
	readonly type: symbol;
	fetch(url: string): Promise<Track[]>;
	generateKey(query: string): Key;
}

export interface Matcher {
	matcher: RegExp;
	strategy: PlaylistRetriever | TrackRetriever;
}

export interface PlayStrategySelector {
	select(url: string): PlaylistRetriever | TrackRetriever;
}
