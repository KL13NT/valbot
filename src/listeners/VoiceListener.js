const { CLIENT_ID } = process.env
const { Listener } = require('../structures')

class VoiceListener extends Listener {
	constructor (client) {
		super(client, [
			'voiceStateUpdate'
		])
	}

	async onVoiceStateUpdate (oldState, { member, deaf, mute, id, channel }){
		if(!member.user.bot){
			if(!deaf && !mute && channel){
				LevelsController.trackUser(id)
			}
			else LevelsController.untrackUser(id)
		}
	}
}

module.exports = VoiceListener