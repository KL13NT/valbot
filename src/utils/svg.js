const fs = require('fs')
const path = require('path')
const nodeHtmlToImage = require('node-html-to-image')
const fetch = require('node-fetch')

const FRAME = path.resolve(__dirname, '../media/Frame 1.svg')
const BACKGROUND = '../media/bg.jpg'
const MIC = '../media/mic.png'
const AVATAR = '../media/botlogo.png'

/**
 *
 * @param {File} image
 * @returns {string} base64
 */
const imagetoURI = image => {
	const base64Image = new Buffer.from(image).toString('base64')
	const dataURI = 'data:image/jpeg;base64,' + base64Image

	return dataURI
}

/**
 *
 * @param {string} url
 * @returns {Buffer} image object
 */
const getImageFromURL = async url => {
	return imagetoURI(
		process.env.MODE !== 'PRODUCTION'
			? new Buffer.from(fs.readFileSync(path.resolve(__dirname, url)))
			: await (await fetch(url)).buffer()
	)
}

/**
 *
 * @param {object} param0
 * @param {object} param0.levelInfo from redis & mongo
 * @param {object} param0.userInfo id, displayName, avatar_url
 * @returns {object} content object for puppeteer
 */
const getContentObject = async ({ userInfo, levelInfo }) => {
	const { avatar_url, displayName, USER_ID } = userInfo
	const { exp, levelEXP, level, text, voice } = levelInfo

	const background = await getImageFromURL(BACKGROUND)
	const mic = await getImageFromURL(MIC)

	const avatar = await getImageFromURL(
		process.env.MODE !== 'PRODUCTION' ? AVATAR : avatar_url
	)

	return {
		CANVAS_BACKGROUND: background,
		USER_AVATAR: avatar, //User.avatarURL()
		ICON_MIC: mic,
		USER_ID,
		CURRENT_LEVEL: level,
		USER_NAME: displayName,
		CURRENT_EXP: exp,
		LEVEL_EXP: levelEXP,
		VOICE_LEVEL: voice,
		TEXT_LEVEL: text
	}
}

/**
 * Returns card image after rendering it in puppeteer
 * @param {object} userInfo
 * @param {object} levelInfo
 */
async function generateRankCard(userInfo, levelInfo) {
	const template = fs.readFileSync(FRAME, 'utf-8')
	const content = await getContentObject({ userInfo, levelInfo })

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
	})
}

module.exports = {
	generateRankCard
}
