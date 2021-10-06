import { SpotifyStrategySelector } from "./SpotifyBehavior";
import { YoutubeStrategySelector, YoutubeTrack } from "./YouTubeBehavior";

export default class ResolveBehavior {
	//TODO: add cache behavior here
	private default = new YoutubeTrack();
	private selectors = [
		new SpotifyStrategySelector(),
		new YoutubeStrategySelector(),
	];

	/**
	 *
	 * @throws
	 */
	public fetch = (url: string) => {
		const strategy = this.determineStrategy(url) || this.default;

		return strategy.fetch(url);
	};

	private determineStrategy = (url: string) => {
		const selected = this.selectors.find(selector => selector.select(url));
		return selected ? selected.select(url) : null;
	};
}
