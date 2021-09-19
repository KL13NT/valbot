import fetch from "node-fetch";

interface Snippet {
	title: string;
	liveBroadcastContent: "live" | "none";
}

interface VideoIdType {
	videoId: string;
}

interface ContentDetails {
	duration: string;
}

interface Item {
	snippet: Snippet;
	contentDetails: ContentDetails;
	id?: VideoIdType;
}

export interface YouTubeResponse {
	items: Item[];
}

const fields = ["items.id"];

const YOUTUBE_URL = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&safeSearch=none&${fields.join(
	"%2C",
)}&key=${process.env.YOUTUBE_KEY}`;

/**
 * To customise this request @see this: https://developers.google.com/youtube/v3/code_samples/code_snippets?apix_params=%7B%22part%22%3A%5B%22snippet%22%5D%2C%22id%22%3A%5B%22Ks-_Mh1QhMc%22%5D%2C%22fields%22%3A%22items.snippet.title%22%7D&apix=true
 */
export const searchVideoMeta = (query: string): Promise<YouTubeResponse> =>
	fetch(`${YOUTUBE_URL}&q=${encodeURIComponent(query)}`, {
		headers: {
			Accept: "application/json",
		},
	}).then(res => res.json());
