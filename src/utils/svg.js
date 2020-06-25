const fs = require('fs');
const path = require('path');
const nodeHtmlToImage = require('node-html-to-image');

const FRAME = path.resolve(__dirname, '../media/Frame 1.svg');
const BACKGROUND = '../media/bg.jpg';
const MIC = '../media/mic.png';
const AVATAR = '../media/botlogo.png';

/**
 *
 * @param {Buffer} image
 * @returns {string} base64
 */
const imageToURI = image => {
	const base64Image = new Buffer.from(image).toString('base64');
	const dataURI = 'data:image/jpeg;base64,' + base64Image;

	return dataURI;
};

/**
 * Gets local images
 * @param {string} url
 * @returns {Buffer} image object
 */
const getLocalImageFromURL = url => {
	const file = fs.readFileSync(path.resolve(__dirname, url));
	return new Buffer.from(file);
};

/**
 * Gets remote images
 * @param {string} url
 * @returns {Buffer} image object
 */
const getRemoteImageFromURL = async url => {
	const resolved = await global.fetch(url);
	return await resolved.buffer();
};

/**
 *
 * @param {object} param0
 * @param {object} param0.levelInfo from redis & mongo
 * @param {object} param0.userInfo id, displayName, avatar_url
 * @returns {object} content object for puppeteer
 */
const getContentObject = async ({ userInfo, levelInfo }) => {
	const { avatar_url, displayName } = userInfo;
	const { exp, levelEXP, level, text, voice } = levelInfo;

	const bgBuffer = await getLocalImageFromURL(BACKGROUND);
	const micBuffer = await getLocalImageFromURL(MIC);
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
 * @param {object} userInfo
 * @param {object} levelInfo
 */
async function generateRankCard(userInfo, levelInfo) {
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

module.exports = {
	imageToURI,
	getLocalImageFromURL,
	getRemoteImageFromURL,
	getContentObject,
	generateRankCard
};
