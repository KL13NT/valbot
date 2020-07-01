const {
	getMemberObject,
	getChannelObject,
	getRoleObject
} = require('../../src/utils/object')

const {
	availableChannel,
	unavailableChannel,
	member,
	client,
	role,
	devChannel
} = require('../../__mocks__/objects')

describe('getChannelObject test suites in development', () => {
	beforeAll(() => {
		process.env.MODE = 'DEVELOPMENT'
	})

	test('should return dev channel', () => {
		expect(getChannelObject(client, availableChannel.id)).toEqual(devChannel)
	})

	test('should return dev channel even if passed id is not available', () => {
		expect(getChannelObject(client, unavailableChannel.id)).toEqual(devChannel)
	})
})

describe('getChannelObject test suites in production mode', () => {
	beforeAll(() => {
		process.env.MODE = 'PRODUCTION'
	})

	test('should return channel object if available and undefiend if not', () => {
		expect(getChannelObject(client, availableChannel.id)).toEqual(
			availableChannel
		)

		expect(getChannelObject(client, unavailableChannel.id)).toBe(undefined)
	})
})

describe('getRoleObject test suites', () => {
	test('should return role by id or name if available or undefined if not', () => {
		expect(getRoleObject(client, role.id)).toEqual(role)
		expect(getRoleObject(client, role.name)).toEqual(role)

		expect(getRoleObject(client, 'incorrect name')).toBe(undefined)
		expect(getRoleObject(client, '7813587346588734')).toBe(undefined)
	})
})

describe('getMemberObject test suites', () => {
	test('Should return member and undefined if not found', () => {
		expect(getMemberObject(client, member.id)).toEqual(member)
		expect(getMemberObject(client, '33324873248239432')).toBe(undefined)
	})
})
