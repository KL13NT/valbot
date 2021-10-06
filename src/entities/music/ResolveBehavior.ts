import CacheBehavior from "./CacheBehavior";
import { SpotifyStrategySelector } from "./SpotifyBehavior";
import { YoutubeStrategySelector } from "./YouTubeBehavior";

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
	public fetch = async (url: string) => {
		const strategy = this.determineStrategy(url);
		const key = strategy.generateKey(url);

		const result = this.cache.resolve(strategy, key);
		if (result) return result;

		const response = await strategy.fetch(url);

		if (Array.isArray(response)) this.cache.addPlaylist(key, response);
		else this.cache.addTrack(response.key, response);

		return response;
	};

	private determineStrategy = (url: string) => {
		const selected = this.selectors.find(selector => selector.select(url));
		return selected ? selected.select(url) : null;
	};
}
