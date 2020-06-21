const { MongoClient } = require('mongodb')
const { DATABASE_INIT_FAILED } = require('../config/events.json')

const { Controller } = require('../structures')
const { log } = require('../utils/general')

/**
 * @global
 */
class MongoController extends Controller {
	constructor(client) {
		super(client, {
			name: 'mongo'
		})
		this.ready = false

		this.mongo = new MongoClient(process.env.DB_HOST, { useNewUrlParser: true })

		this.init = this.init.bind(this)
		this.syncLevels = this.syncLevels.bind(this)
		this.getLevel = this.getLevel.bind(this)
		this.getLevels = this.getLevels.bind(this)
		this.getMilestones = this.getMilestones.bind(this)
		this.getResponses = this.getResponses.bind(this)
		this.syncLevels = this.syncLevels.bind(this)

		this.init()
	}

	async init() {
		try {
			await this.mongo.connect()
			this.db = this.mongo.db(process.env.DB_NAME)

			if (typeof this.db !== 'undefined') {
				this.ready = true

				this.client.emit('queueExecute', 'Mongo controller ready')
			}
		} catch (err) {
			const message = `Something went wrong when initialising Mongo, ${err.message}, <@238009405176676352>`

			log(this.client, message, 'error')
		}
	}

	async syncLevels(id, { exp, text, voice, level, textXP, voiceXP }) {
		if (this.ready) {
			await this.db.collection('levels').updateOne(
				{ id },
				{
					$set: { exp, text, voice, level, textXP, voiceXP }
				},
				{
					upsert: true
				}
			)
		} else
			this.client.controllers.queue.enqueue(this.syncLevels, id, {
				exp,
				text,
				voice
			})
	}

	async getLevel(id) {
		if (this.ready) {
			return this.db.collection('levels').findOne({ id })
		}
	}

	async getLevels() {
		if (this.ready) {
			return this.db.collection('levels').find({})
		}
	}

	async getMilestones() {
		if (this.ready) {
			return this.db.collection('milestones').find({})
		}
	}

	async getResponses() {
		if (this.ready) {
			return this.db.collection('responses').find({})
		}
	}

	/**
	 * Stores new responses, teaches bot
	 * @param {*} param0 reponse
	 */
	async saveResponse({ invoker, reply }) {
		if (this.ready) {
			return this.db.collection('responses').updateOne(
				{
					invoker
				},
				{
					$set: {
						invoker,
						reply
					}
				},
				{
					upsert: true
				}
			)
		} else
			this.client.controllers.queue.enqueue(this.saveResponse, {
				invoker,
				reply
			})
	}
}

module.exports = MongoController
