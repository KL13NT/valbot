"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
const general_1 = require("../utils/general");
class ClientReadyListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onReady = () => {
            this.client.setPresence();
            this.client.ValGuild = this.client.guilds.cache.first();
            this.client.emit('queueExecute', 'Client ready');
            general_1.log(this.client, 'Client ready', 'info');
        };
        this.events.set('ready', this.onReady);
    }
}
exports.default = ClientReadyListener;
