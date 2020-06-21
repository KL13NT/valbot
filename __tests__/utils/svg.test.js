const { resolve } = require('path')
const { readFileSync } = require('fs')
const {
	imageToURI,
	getLocalImageFromURL,
	getRemoteImageFromURL,
	getContentObject,
	generateRankCard
} = require('../../src/utils/svg')

const bgPath = '../../src/media/bg.jpg'
const file = readFileSync(resolve(__dirname, '../../src/media/bg.jpg'))
const buffer = new Buffer.from(file)
const string = ('data:image/jpeg;base64' + buffer.toString('base64')).substr(
	0,
	20
)

global.fetch = jest.fn(() =>
	Promise.resolve({
		buffer: () => Promise.resolve(buffer)
	})
)

beforeEach(() => {
	global.fetch.mockClear()
})

describe('imagetoURI test suites', () => {
	test('should return image uri if passed file object/buffer', () => {
		expect(imageToURI(buffer)).toBeString()
		expect(imageToURI(buffer).substr(0, 20)).toEqual(string)
	})
})

describe('getLocalImageFromURL test suites', () => {
	test('should resolve if image file exists', () => {
		expect(getRemoteImageFromURL(bgPath)).toResolve()
	})

	test('should return logo image buffer', () => {
		expect(getLocalImageFromURL(bgPath)).toBeObject()
		expect(getLocalImageFromURL(bgPath).slice(0, 20)).toEqual(
			buffer.slice(0, 20)
		)
	})
})

describe('getContentObject test suites', () => {
	const userInfo = {
		avatar_url: bgPath,
		displayName: 'Test Username'
	}

	const levelInfo = {
		exp: 5,
		levelEXP: 5,
		level: 5,
		text: 5,
		voice: 5
	}

	const content = [
		'CANVAS_BACKGROUND',
		'USER_AVATAR',
		'ICON_MIC',
		'CURRENT_LEVEL',
		'USER_NAME',
		'CURRENT_EXP',
		'LEVEL_EXP',
		'VOICE_LEVEL',
		'TEXT_LEVEL'
	]

	test('should have proper keys if image file exists', () => {
		getContentObject({ userInfo, levelInfo }).then(result =>
			expect(Object.keys(result)).toIncludeSameMembers(content)
		)
	})
})
