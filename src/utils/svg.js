const fs = require('fs')
const path = require('path')
const nodeHtmlToImage = require('node-html-to-image')
const fetch = require('node-fetch')

async function generateRankCard ({ avatar_url, displayName, displayID, exp }) {
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
		USER_NAME: displayName,
		USER_EXP_TO_NEXT_LEVEL: exp.expToNextLevel,
		USER_VOICE_EXP: exp.voice,
		USER_TEXT_EXP: exp.text
	}

	nodeHtmlToImage({
		output: './image.png', //https://github.com/frinyvonnick/node-html-to-image#using-the-buffer-instead-of-saving-to-disk
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
		content
	})

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
		content
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