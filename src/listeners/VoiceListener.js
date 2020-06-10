const { CLIENT_ID } = process.env
const { Listener } = require('../structures')

class VoiceListener extends Listener {
	constructor (client) {
		super(client, [
			'voiceStateUpdate'
		])
	}

	async onVoiceStateUpdate (oldState, newState){
		if(!newState.deaf && !newState.mute && !newState.member.user.bot){
			LevelsController.trackUser(newState.id)
		}
		else LevelsController.untrackUser(newState.id)
	}
}

module.exports = VoiceListener