import fs from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { SVGContentOptions, SVGContent } from "../types/interfaces";

import fetch from "node-fetch";

const readFile = promisify(fs.readFile);

const AVATAR = "../../media/botlogo.png";
const BASE64 = "data:image/jpeg;base64,";

/**
 * Converts images into Base64 URIs
 */
export const imageToURI = (image: Buffer) => {
	return BASE64 + Buffer.from(image).toString("base64");
};

/**
 * Fetches local images
 */
export const getLocalImageFromURL = async (url: string) => {
	return readFile(resolve(__dirname, url));
};

/**
 * Fetches remote images
 */
export const getRemoteImageFromURL = async (url: string) => {
	const resolved = await fetch(url);
	return resolved.buffer();
};

/**
 * Creates SVG content object
 */
export const getContentObject = async ({
	userInfo,
	levelInfo,
}: SVGContentOptions): Promise<SVGContent> => {
	// eslint-disable-next-line camelcase
	const { avatarUrl, displayName } = userInfo;
	const { exp, levelEXP, level, text, voice } = levelInfo;

	const avatarBuffer =
		process.env.MODE !== "PRODUCTION"
			? await getLocalImageFromURL(AVATAR)
			: await getRemoteImageFromURL(avatarUrl);

	const avatar = imageToURI(Buffer.from(avatarBuffer));

	return {
		USER_AVATAR: avatar, //User.avatarURL()
		CURRENT_LEVEL: level,
		USER_NAME: displayName,
		CURRENT_EXP: exp,
		LEVEL_EXP: levelEXP,
		VOICE_LEVEL: voice,
		TEXT_LEVEL: text,
	};
};

/**
 * Returns card image after rendering it in puppeteer
 */
// export async function generateRankCard(
// 	userInfo: UserInfo,
// 	levelInfo: SVGContentLevelInfo
// ) {
// 	return nodeHtmlToImage({
// 		html: `<html>
// 				<head>
// 					<style>
// 						body {
// 							width: 1580px;
// 							height: 390px;
// 						}
// 					</style>
// 				</head>
// 				<body>
// 					${FRAME}
// 				</body>
// 				</html>`,
// 		content,
// 		puppeteerArgs: {
// 			args: ['--no-sandbox', '--disable-setuid-sandbox']
// 		},
// 		encoding: 'binary'
// 	});
// }
