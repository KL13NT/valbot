"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
class VoiceListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onVoiceStateUpdate = (_, newState) => {
            const { member, id } = newState;
            if (member.user.bot)
                return;
            const levels = this.client.controllers.get('levels');
            if (this.shouldTrack(newState))
                levels.trackUser(id);
            else
                levels.untrackUser(id);
        };
        this.shouldTrack = (state) => {
            const { deaf, mute, channel } = state;
            return !deaf && !mute && channel && channel.id !== '571721579214667786';
        };
        this.events.set('voiceStateUpdate', this.onVoiceStateUpdate);
    }
}
exports.default = VoiceListener;
