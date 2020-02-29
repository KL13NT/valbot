const ValClient = new (require('./src/ValClient'))({ fetchAllMembers: true })
// const Database = new (require(`./src/database/Database`))()
const Logger = new (require('./src/utils/Logger'))(__dirname, './logs')


async function start () {
	Logger.console('info', 'Starting ValClient')

	ValClient.init(process.env.AUTH_TOKEN)

	ValClient.on('error', err => {
		console.log('An error occured with ValClient', err)
		process.exit()
	})

	// We don't need a database currently
	// Logger.file(`info`, `Initialising Database`)
	// if(Database.init()) Logger.file(`info`, `Initialised Database successfully`)

}

start()