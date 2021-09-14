import fetch from "node-fetch";

type Snippet = {
	title: string;
};

type Item = {
	snippet: Snippet;
};

export interface YouTubeResponse {
	items: Item[];
}

/**
 * To customise this request @see this: https://developers.google.com/youtube/v3/code_samples/code_snippets?apix_params=%7B%22part%22%3A%5B%22snippet%22%5D%2C%22id%22%3A%5B%22Ks-_Mh1QhMc%22%5D%2C%22fields%22%3A%22items.snippet.title%22%7D&apix=true
 */
export const fetchVideoMeta = (id: string): Promise<YouTubeResponse> =>
	fetch(
		`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&fields=items.snippet.title&key=${process.env.YOUTUBE_KEY}`,
		{
			headers: {
				Accept: "application/json",
			},
		},
	).then(res => res.json());
