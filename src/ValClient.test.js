/* eslint-env node, jest */

jest.mock(`./utils/Logger`)
jest.mock(`./utils/InsultFiltering.js`)

describe(`ValClient tests`, () => {
	it(`should return true`, () => {
		expect(true).toBe(true)
	})
})