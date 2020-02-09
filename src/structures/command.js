const CommandContext = require(`./CommandContext`)
const CommandOptions = require(`./CommandOptions`)

/**
 * Command Structure
 * @param {ValClient} client Valarium-bot client
 * @param {CommandOptions} options Command initialisation options
 * @property {boolean} ready Whether command can be used
 */

class Command{
	constructor (client, options) {

		if(!(options instanceof CommandOptions)) throw Error(`Command options invalid`)

		this.client = client
		this.options = options
		this.ready = true

		/**
		 * Auth levels description:
		 * @property {RoleID} 0 Developers
		 * @property {RoleID} 1 High Table [admin]
		 * @property {RoleID} 2 Protectors [mod]
		 * @property {RoleID} 3 Verified members role
		 * @property {RoleID} 4 Unauthorised to use bot
		 */
		this.AUTH_LEVELS = {
			571824921576079362: 0,
			571705643073929226: 1,
			571705797583831040: 2,
			586490288579543041: 3
		}
	}

	/**
	 * Checks whether member has sufficient auth
	 * @param {GuildMember} context message context
	 * @private
	 */
	isAllowed ({ member }){
		for(const permission of this.options.requiredPermissions){
			if(!member.hasPermission(permission)) return false
		}
		return true
		// for(const { id: roleId } of Array.from(member.roles.values())){
		// 	// if a user's authLevel is lower than required in means they have higher roles
		// 	// and qualified to run command
		// 	console.log(this.AUTH_LEVELS[roleId], roleId)
		// 	if(this.AUTH_LEVELS[roleId] <= this.options.authLevel){
		// 		return true
		// 	}
		// }
		// return false
	}

	/**
	 * Enforces command code to create context correctly
	 * @param {CommandContext} context message context
	 * @private
	 */
	checkContext (context){
		return context instanceof CommandContext
	}

	/**
	 * Determines whether user is allowed to use this command
	 * @param {CommandContext} context message context
	 * @private
	 */
	run (context){
		const { cooldown } = this.options

		if(this.checkContext(context) && this.isAllowed(context)) {
			if(this.ready) this._run(context)

			if(cooldown !== 0){
				this.ready = false

				setTimeout(() => {
					this.ready = true
				}, cooldown)
			}
		}
		else {
			context.message.reply(`
				مش مسموح لك تستخدم الكوماند دي
			`)
		}
	}

	/**
	 * Responsible for running commands. Should be overridden in each command.
	 * @param {CommandContext} context
	 */
	async _run (context) {
		// return true;
	}

	help (context){

		const { message } = context
		const { nOfParams, exampleUsage, description } = this.options

		message.reply(`
			معلومات عن ${this.options.name}:
			الاستعمال:\n\`${exampleUsage}\`
			الوظيفة:\n\`${description}\`
			بتاخد كام باراميتير\n\`${nOfParams}\`
		`)

	}
}

module.exports = Command