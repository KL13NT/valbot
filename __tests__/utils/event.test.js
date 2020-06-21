const { createEventMessage } = require('../../src/utils/event')

describe('createEventMessage test suites', () => {
	const event = {
		template: 'This is a {{name}} template. Value will be placed {{here}}.',
		variables: [
			{
				name: 'name',
				value: 'test'
			},
			{
				name: 'here',
				value: 'VALUE'
			}
		]
	}
	const result = 'This is a test template. Value will be placed VALUE.'

	test('Should return proper string with variables replaced', () => {
		expect(createEventMessage(event)).toEqual(result)
	})
})
