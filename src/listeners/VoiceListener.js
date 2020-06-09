const { CLIENT_ID } = process.env
const { Listener } = require('../structures')

class VoiceListener extends Listener {
	constructor (client) {
		super(client, [
			'voiceStateUpdate'
		])
	}

	async onVoiceStateUpdate (oldState, newState){
		if(!newState.deaf && !newState.mute){
			LevelsController.trackUser(newState.id)
		}
		else LevelsController.untrackUser(newState.id)
	}

	/**
	 * If user  just joined a voice channel
	 * 	If user is NOT muted & NOT deafened start timer
	 * 	If user is deafened OR muted stop timer

	 * If user already joined
	 * 	If mute/deafen/disconnect event fired
	 * 		Stop timer
	 * 	If unmute/undeafen event fired
	 * 		Start timer
	 */
}

module.exports = VoiceListener