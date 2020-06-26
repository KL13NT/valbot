import fs from 'fs';
import path from 'path';
import { nodeHtmlToImage } from 'node-html-to-image';
import {
	SVGContentOptions,
	SVGContent,
	SVGContentLevelInfo,
	UserInfo
} from '../types/interfaces';

const FRAME = path.resolve(__dirname, '../media/Frame 1.svg');
const BACKGROUND = '../media/bg.jpg';
const MIC = '../media/mic.png';
const AVATAR = '../media/botlogo.png';

/**
 * Converts images into Base64 URIs
 */
export const imageToURI = (image: Buffer) => {
	const base64Image = Buffer.from(image).toString('base64');
	const dataURI = 'data:image/jpeg;base64,' + base64Image;

	return dataURI;
};

/**
 * Fetches local images
 */
export const getLocalImageFromURL = (url: string) => {
	const file = fs.readFileSync(path.resolve(__dirname, url));
	return Buffer.from(file);
};

/**
 * Fetches remote images
 */
export const getRemoteImageFromURL = async (url: string) => {
	const resolved = await global.fetch(url);
	return Buffer.from(await resolved.arrayBuffer());
};

/**
 * Creates SVG content object
 */
export const getContentObject = async ({
	userInfo,
	levelInfo
}: SVGContentOptions): Promise<SVGContent> => {
	const { avatar_url, displayName } = userInfo;
	const { exp, levelEXP, level, text, voice } = levelInfo;

	const bgBuffer = getLocalImageFromURL(BACKGROUND);
	const micBuffer = getLocalImageFromURL(MIC);
	const avatarBuffer =
		process.env.MODE !== 'PRODUCTION'
			? getLocalImageFromURL(AVATAR)
			: await getRemoteImageFromURL(avatar_url);

	const background = imageToURI(bgBuffer);
	const mic = imageToURI(micBuffer);
	const avatar = imageToURI(avatarBuffer);

	return {
		CANVAS_BACKGROUND: background,
		USER_AVATAR: avatar, //User.avatarURL()
		ICON_MIC: mic,
		CURRENT_LEVEL: level,
		USER_NAME: displayName,
		CURRENT_EXP: exp,
		LEVEL_EXP: levelEXP,
		VOICE_LEVEL: voice,
		TEXT_LEVEL: text
	};
};

/**
 * Returns card image after rendering it in puppeteer
 */
export async function generateRankCard(
	userInfo: UserInfo,
	levelInfo: SVGContentLevelInfo
) {
	const template = fs.readFileSync(FRAME, 'utf-8');
	const content = await getContentObject({ userInfo, levelInfo });

	return nodeHtmlToImage({
		html: `<html>
				<head>
					<style>
						body {
							width: 1580px;
							height: 390px;
						}
					</style>
				</head>
				<body>
					${template}
				</body>
				</html>`,
		content,
		puppeteerArgs: {
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		}
	});
}
