const {
	getAlertStatus,
	getMessage,
	log,
	notify,
	calculateUniqueWords
} = require('../../src/utils/general')

describe('getAlertStatus test suites', () => {
	const states = [
		{
			input: 'info',
			output: ':grey_question:'
		},
		{
			input: 'warn',
			output: ':warning:'
		},
		{
			input: 'error',
			output: ':x:'
		}
	]

	test('should return respective value', () => {
		states.forEach(state => {
			expect(getAlertStatus(state.input)).toEqual(state.output)
		})
	})

	test('should throw if value unknown', () => {
		expect(() => getAlertStatus('unknown')).toThrow(
			'Alert level not recognised'
		)
	})
})

describe('getMessage test suites', () => {
	const notify = 'This is a test notification'
	const mention = `<@${process.env.ROLE_DEVELOPER}>`

	const infoNotify = `:grey_question: ${notify}`
	const warnNotify = `:warning: ${notify} ${mention}`
	const errorNotify = `:x: ${notify} ${mention}`

	test('getMessage should return message with mention if passed warn or error', () => {
		expect(getMessage(notify, 'warn')).toContain(mention)
		expect(getMessage(notify, 'error')).toContain(mention)
	})

	test('getMessage should return respective notification to state', () => {
		expect(getMessage(notify, 'info')).toEqual(infoNotify)
		expect(getMessage(notify, 'warn')).toEqual(warnNotify)
		expect(getMessage(notify, 'error')).toEqual(errorNotify)
	})

	test('getMessage should throw if passed state unrecognised', () => {
		expect(() => getMessage(notify, 'unknown')).toThrow(
			'Alert level not recognised'
		)
	})
})

describe('calculateUniqueWords test suites', () => {
	const string1 = 'This has two two repeated words'
	const string2 = 'This has three three three repeated words words words twice'

	const unique1 = 5
	const unique2 = 6

	test('should return proper count', () => {
		expect(calculateUniqueWords(string1)).toEqual(unique1)
		expect(calculateUniqueWords(string2)).toEqual(unique2)
	})
})
