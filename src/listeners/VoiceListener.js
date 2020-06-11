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
			//REFACTORME: There's prolly better logic for channel 'type'
			if(!deaf && !mute && channel){
				if(channel.id !== '571721579214667786') LevelsController.trackUser(id)
			}
			else LevelsController.untrackUser(id)
		}
	}
}

module.exports = VoiceListener