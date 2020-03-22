const ValClient = require('./src/ValClient')


const client = new ValClient({ fetchAllMembers: true })

client.init(process.env.AUTH_TOKEN)
client.on('error', err => {
	console.log('An error occured with ValClient', err)
	process.exit()
})