const { CLIENT_ID } = process.env;
const { Listener } = require('../structures');

class VoiceListener extends Listener {
	constructor(client) {
		super(client, ['voiceStateUpdate']);

		this.onVoiceStateUpdate = this.onVoiceStateUpdate.bind(this);
	}

	async onVoiceStateUpdate(oldState, { member, deaf, mute, id, channel }) {
		if (!member.user.bot) {
			//REFACTORME: There's prolly better logic for channel 'type'
			if (!deaf && !mute && channel && channel.id !== '571721579214667786') {
				this.client.controllers.levels.trackUser(id);
			} else this.client.controllers.levels.untrackUser(id);
		}
	}
}

module.exports = VoiceListener;
