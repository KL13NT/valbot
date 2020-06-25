import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { VoiceState } from 'discord.js';
export default class VoiceListener extends Listener {
    constructor(client: ValClient);
    onVoiceStateUpdate: (_: VoiceState, newState: VoiceState) => void;
    shouldTrack: (state: VoiceState) => boolean;
}
