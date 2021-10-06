import { Song } from "../../types/interfaces";

export type Track = Omit<Song, "requestingUserId" | "id">;

export interface TrackRetriever {
	readonly type: symbol;
	fetch(query: string): Promise<Track>;
}

export interface PlaylistRetriever {
	readonly type: symbol;
	fetch(url: string): Promise<Track[]>;
}

export interface PlayStrategySelector {
	select(url: string): PlaylistRetriever | TrackRetriever;
}
