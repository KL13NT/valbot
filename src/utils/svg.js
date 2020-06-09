const fs = require('fs')
const path = require('path')
const nodeHtmlToImage = require('node-html-to-image')
const fetch = require('node-fetch')

async function generateRankCard (userInfo, levelInfo) {
	const { avatar_url, displayName, displayID } = userInfo
	const { exp, levelEXP, level, text, voice } = levelInfo

	const background = imagetoURI('../media/bg.jpg')
	const mic = imagetoURI('../media/mic.png')
	const framePath = path.resolve(__dirname, '../media/Frame 1.svg')
	const template = fs.readFileSync(framePath, 'utf-8')

	const avatarRes = await fetch(avatar_url)
	const buffer = await avatarRes.buffer()
	const avatar = imagetoURI(buffer)


	const content = {
		CANVAS_BACKGROUND: background,
		USER_AVATAR: avatar, //User.avatarURL()
		ICON_MIC: mic,
		USER_ID: displayID,
		CURRENT_LEVEL: level,
		USER_NAME: displayName,
		CURRENT_EXP: exp,
		LEVEL_EXP: levelEXP,
		VOICE_LEVEL: voice,
		TEXT_LEVEL: text
	}

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
			args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
		}
	})
}

function imagetoURI (loc) {
	const image =
		typeof loc === 'string'
			? fs.readFileSync(path.resolve(__dirname, loc))
			: loc
	const base64Image = new Buffer.from(image).toString('base64')
	const dataURI = 'data:image/jpeg;base64,' + base64Image

	return dataURI
}

// generateRankCard(
// 	{
// 		avatar_url: 'https://cdn.discordapp.com/avatars/403853007243968512/91603ecac4c86a22029146111e921ece.png?size=1024',
// 		displayName: 'Sovereign',
// 		displayID: '4984',
// 		exp: {
// 			voice: 20,
// 			text: 9,
// 			expToNextLevel: 95
// 		}
// 	}
// )

module.exports = {
	generateRankCard
}