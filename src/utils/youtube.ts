import fetch from "node-fetch";

interface VideoIdType {
	videoId: string;
}

interface Item {
	id: VideoIdType;
}

export interface YouTubeResponse {
	items: Item[];
}

const YOUTUBE_URL = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&order=relevance&safeSearch=none&type=video&fields=items.id.videoId&key=${process.env.YOUTUBE_KEY}`;

/**
 * To customise this request @see this: https://developers.google.com/youtube/v3/code_samples/code_snippets?apix=true&apix_params=%7B%22part%22%3A%5B%22snippet%22%5D%2C%22maxResults%22%3A1%2C%22order%22%3A%22relevance%22%2C%22q%22%3A%22the%20great%20wall%20ost%22%2C%22safeSearch%22%3A%22none%22%2C%22type%22%3A%5B%22video%22%5D%2C%22fields%22%3A%22items.id.videoId%22%2C%22prettyPrint%22%3Afalse%7D
 */
export const searchVideoMeta = (query: string): Promise<YouTubeResponse> =>
	fetch(`${YOUTUBE_URL}&q=${encodeURIComponent(query)}`, {
		headers: {
			Accept: "application/json",
		},
	}).then(res => res.json());
