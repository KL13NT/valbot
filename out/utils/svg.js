"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_html_to_image_1 = __importDefault(require("node-html-to-image"));
const FRAME = path_1.default.resolve(__dirname, '../media/Frame 1.svg');
const BACKGROUND = '../media/bg.jpg';
const MIC = '../media/mic.png';
const AVATAR = '../media/botlogo.png';
const imageToURI = (image) => {
    const base64Image = Buffer.from(image).toString('base64');
    const dataURI = 'data:image/jpeg;base64,' + base64Image;
    return dataURI;
};
const getLocalImageFromURL = (url) => {
    const file = fs_1.default.readFileSync(path_1.default.resolve(__dirname, url));
    return Buffer.from(file);
};
const getRemoteImageFromURL = async (url) => {
    const resolved = await global.fetch(url);
    return Buffer.from(await resolved.arrayBuffer());
};
const getContentObject = async ({ userInfo, levelInfo }) => {
    const { avatar_url, displayName } = userInfo;
    const { exp, levelEXP, level, text, voice } = levelInfo;
    const bgBuffer = getLocalImageFromURL(BACKGROUND);
    const micBuffer = getLocalImageFromURL(MIC);
    const avatarBuffer = process.env.MODE !== 'PRODUCTION'
        ? getLocalImageFromURL(AVATAR)
        : await getRemoteImageFromURL(avatar_url);
    const background = imageToURI(bgBuffer);
    const mic = imageToURI(micBuffer);
    const avatar = imageToURI(avatarBuffer);
    return {
        CANVAS_BACKGROUND: background,
        USER_AVATAR: avatar,
        ICON_MIC: mic,
        CURRENT_LEVEL: level,
        USER_NAME: displayName,
        CURRENT_EXP: exp,
        LEVEL_EXP: levelEXP,
        VOICE_LEVEL: voice,
        TEXT_LEVEL: text
    };
};
async function generateRankCard(userInfo, levelInfo) {
    const template = fs_1.default.readFileSync(FRAME, 'utf-8');
    const content = await getContentObject({ userInfo, levelInfo });
    return node_html_to_image_1.default({
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
