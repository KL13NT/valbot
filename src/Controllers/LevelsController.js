const { CLIENT_ID } = process.env
const { Controller, Level } = require('../structures')
const { log, calculateUniqueWords } = require('../utils/utils')



class LevelsController extends Controller {
	constructor (client){
		super(client, {
			name: 'LevelsController'
		})

		this.message = this.message.bind(this)
		this.levelUpMessage = this.levelUpMessage.bind(this)
		// this.voice = this.voice.bind(this)
		// this.levelUpVoice = this.levelUpVoice.bind(this)
		console.log('Text levels controller ready!')
	}
	/**
	 *
	 * @param {Message} message
	 */
	async message (message) {
		const { member, content } = message
		const { user } = member
		const { id } = user

		try{
			const exp = Number(await RedisController.get(`EXP:${id}`)) // 40
			const text = Number(await RedisController.get(`TEXT:${id}`)) // 40
			const gainedWords = calculateUniqueWords(content) // 120

			if(exp){
				const nextText = Math.floor(((exp + gainedWords) / 6) - 60)
				const textIncrBy = nextText - text <= 0? 1: nextText - text

				if(exp + gainedWords >= ((60 * Number(text) * 0.1) + 60)) {

					RedisController.incrby(`TEXT:${id}`, textIncrBy)
					RedisController.set(`EXP:${id}`, 1)

					this.levelUpMessage(message)
				}
				else RedisController.incrby(`EXP:${id}`, gainedWords)
			}

			else {
				RedisController.set(`EXP:${id}`, 1)
				RedisController.set(`TEXT:${id}`, 1)
				RedisController.set(`VOICE:${id}`, 1)
				// this.client.levels[id] = new Level(1, 1, 1)

				this.levelUpMessage(message)
			}

		}
		catch(err){
			log(this.client, err.message, 'error')
		}
		// message.reply('Hello')

		/**
		 * The way this algorithm will work
		 * It'll take a message and extract needed data from it
		 * It'll then check currently available ValClient.levels for the user
		 * 	If user is found it'll increment
		 * 		If user is at a point where they should level up
		 * 			Reply to their message and increase their level
		 *  If user is not found
		 * 		A DB query creates a new document and loads it locally
		 *
		 * All of this needs a listener for messages
		 * This will utilise MessageListener with an added condition
		 * and will apply needed logic
		 */

		/**
		 * The way the voice algorithm will work
		 * Users join and leave voice channels
		 * Start a background interval that synchronises levels to the DB
		 *   If user has been in voice channel for 5 minutes or more, sync
		 *   If user leaves keep it local and flag it until another user is synced
		 *     And Piggy back on the other
		 *   If no users are connected but this user, don't sync time for them
		 * On user join event
		 * 	Add user to currently active users (lcoal)
		 * It'll then check currently available ValClient.levels for the user
		 * 	If user is found it'll increment
		 * 		If user is at a point where they should level up
		 * 			Reply to their message and increase their level
		 *  If user is not found
		 * 		A DB query creates a new document and loads it locally
		 *
		 * All of this needs a listener for voice
		 * A new VoiceListener will be created that will report
		 * whenever a user joins or leaves voice chat
		 */

		/**
			* Implementation notes
			* The database doesn't need to know about actual activity
			* And should only be used to store
			* Perhaps a key-value (RedisController?) store should be used for local operations
			* And then flushed to the mongo instance
			*/
	}

	async levelUpMessage (message){
		const { id } = message.member.user
		const exp = Number(await RedisController.get(`EXP:${id}`))
		const text = Number(await RedisController.get(`TEXT:${id}`))
		const voice = Number(await RedisController.get(`VOICE:${id}`))


		MongoController.syncLevels(id, { exp, text, voice })

		message.reply(`مستواك علي! بقيت في المستوى ${text}# :fireworks: <:PutinWaves:668209208113627136> `)
	}
}

module.exports = LevelsController