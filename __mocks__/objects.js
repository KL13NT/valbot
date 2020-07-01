const availableChannel = {
	id: '222222222222222',
	messages: {
		fetch: () => message
	}
}
const devChannel = {
	id: '0000000000000',
	name: 'development'
}
const unavailableChannel = {
	id: '111111111111111',
	messages: {
		fetch: () => undefined
	}
}
const member = {
	id: '00000000000000'
}
const role = {
	id: '00000000000000',
	name: 'Test role'
}
const message = {
	id: '00000000000000000'
}
const guild = {
	name: 'VALARIUM',
	channels: {
		cache: [devChannel, availableChannel]
	},
	members: {
		cache: [member]
	},
	roles: {
		cache: [role]
	}
}
const client = {
	config: {
		CHANNELS: {
			CHANNEL_TEST: '0000000000000'
		}
	},
	guilds: {
		cache: [guild]
	}
}

module.exports = {
	availableChannel,
	unavailableChannel,
	devChannel,
	member,
	role,
	guild,
	message,
	client
}
