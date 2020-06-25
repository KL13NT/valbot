"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
const general_1 = require("../utils/general");
class QueueExecuteListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onQueueExecute = async (reason) => {
            this.client.controllers.get('queue').executeAll();
            general_1.log(this.client, `Executing all queued calls. Reason: ${reason}`, 'info');
        };
        this.events.set('queueExecute', this.onQueueExecute);
    }
}
exports.default = QueueExecuteListener;
