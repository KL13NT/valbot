declare module "node-html-to-image" {
	import { Base64ScreenShotOptions, LaunchOptions } from "puppeteer";
	import { SVGContent } from "./interfaces";

	export interface nodeHtmlToImageOptions {
		html: string;
		output?: string;
		type?: "jpeg" | "png";
		content?: SVGContent;
		quality?: number;
		waitUntil?: "string";
		transparent?: boolean;
		puppeteerArgs?: LaunchOptions;
		encoding?: "base64" | "binary";
	}

	export default function nodeHtmlToImage(
		options: nodeHtmlToImageOptions,
	): Promise<string>;
}

declare module "lyrics-finder" {
	const lyricsFinder: (artist: string, name: string) => Promise<string>;

	export default lyricsFinder;
}
