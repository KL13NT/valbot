"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
const { CLIENT_ID, DEV_CLIENT_ID } = process.env;
class MessageListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onMessage = async (message) => {
            if (this.shouldNotHandle(message))
                return;
            const { prefix, controllers } = this.client;
            const { content, mentions } = message;
            const conversation = controllers.get('conversation');
            const levels = controllers.get('levels');
            const toxicity = controllers.get('toxicity');
            const isToxic = await toxicity.classify(message);
            const isClientMentioned = mentions.members &&
                mentions.members.some(m => m.id === CLIENT_ID || m.id === DEV_CLIENT_ID);
            if (isToxic)
                return toxicity.handleToxic(message);
            if (content.startsWith(prefix))
                this.client.emit('command', message);
            else if (isClientMentioned)
                conversation.converse(message, true);
            levels.message(message);
        };
        this.shouldNotHandle = ({ author, channel, type, webhookID }) => !!webhookID ||
            author.id === CLIENT_ID ||
            author.id === DEV_CLIENT_ID ||
            channel.type !== 'text' ||
            type !== 'DEFAULT';
        this.events.set('message', this.onMessage);
    }
}
exports.default = MessageListener;
