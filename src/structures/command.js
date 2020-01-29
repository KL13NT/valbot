const Context = require(`./CommandContext`)

/**
 * Command Structure
 * @constructor
 * @param {ValClient} client Valarium-bot client
 * @param {Object} context Command context
 * @param {Object} options Command initialisation options
 * @param {String} options.name Command name
 * @param {Number} [options.cooldownTime=0] Time between calls to the same command, default 0 (in seconds)
 * @param {String} [options.category=general | short | long] Category of command
 * @param {Array} [options.flags=[]] Required for the command to function properly
 * @param {aliases} [options.aliases=[]] Aliases for the command
 */

module.exports =  class Command{

	constructor (client, options = {}) {
		const { name, flags, category, aliases, cooldownTime, isCritical } = options
    
		this.client = client
		this.name = name
		this.cooldownTime = cooldownTime || 0
		this.category = category || `general`
		this.flags = flags || []
		this.aliases = aliases || []
		this.isCritical = isCritical || false
		this.isReady = false

    
		this.POSSIBLE_FLAGS = {
			'dev-only': [ `639855023970451457` ],
			'admin-only': [ `571705643073929226`, `571716246660448318` ],
			'mod-only': [ `571705797583831040`, `571705643073929226`, `571716246660448318` ],
			'same-channel-only': `same-channel-only`,
			'database-only': `database-only`
		}

		this.construct()
	}
  
	construct (){
		if(!this.checkFlagsPerms(this.flags)){
			if(this.isCritical) {
				console.error(`Command ${this.name} has illegal flags and is critical, will not work.`)
				process.exit(1)
			}
			else console.error(`\x1b[43m\x1b[30m%s\x1b[0m`, `Command ${this.name} has illegal flags and is critical, will not work.`)
		}
		else {
			this.isReady = true
		}
	}

	// checkAllowance (role, allowance){
	//   if(allowance === `mod-only`) return role === `571705797583831040` || role === `571705643073929226` || role === `571716246660448318` 
	//   else if(allowance === `admin-only`) return role === `571705643073929226` || role === `571716246660448318`
	//   else if(allowance === `dev-only`) return role === `639855023970451457`
	// }


	async init (context) {
		try {
			if (this.isReady && this.checkContext(context)) this.run(context)
			else throw Error(`Command ${this.name} has illegal context attributes. Failed to init.`)
		}
		catch (err) {
			console.err(err)
			//TODO: Log error 
			//TODO: respond to user message with error embed/message
		}
	}

	checkContext (context){
		return context instanceof Context? true: false
	}

 
	async run (context) {
		// return true;
	}


	checkFlagsPerms (flags) {
		const isFlagsValid = flags.findIndex(flag => this.POSSIBLE_FLAGS[flag] === undefined)
    
		const possiblePermissions = Object.keys(this.POSSIBLE_FLAGS)
    
		if (isFlagsValid === -1) return true
		return false
	}
}