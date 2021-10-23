import CacheBehavior from "./CacheBehavior";
import { SpotifyStrategySelector } from "./SpotifyBehavior";
import { YoutubeStrategySelector } from "./YouTubeBehavior";

import UserError from "../../structures/UserError";

export default class ResolveBehavior {
	private cache = new CacheBehavior();
	private selectors = [
		new SpotifyStrategySelector(),
		new YoutubeStrategySelector(),
	];

	/**
	 *
	 * @throws
	 */
	public fetch = async (url: string, retry = true) => {
		const strategy = this.determineStrategy(url);
		const key = strategy.generateKey(url);

		const result = this.cache.resolve(strategy, key);
		if (result) return result;

		try {
			const response = await strategy.fetch(url);

			if (Array.isArray(response)) this.cache.addPlaylist(key, response);
			else this.cache.addTrack(response.key, response);

			return response;
		} catch (error) {
			if (error instanceof Error && error.message.includes("Video unavailable"))
				throw new UserError(
					"Video unavailable. It might be private or not available in the bot's region. If it doesn't render a preview on discord verify the link is valid.",
				);

			if (error instanceof Error && error.message.includes("410"))
				throw new UserError(
					"Couldn't find video. It probably has been deleted.",
				);

			if (error instanceof Error && error.message.includes("403") && retry)
				return this.fetch(url, false);

			throw error;
		}
	};

	private determineStrategy = (url: string) => {
		const selected = this.selectors.find(selector => selector.select(url));
		return selected ? selected.select(url) : null;
	};
}
