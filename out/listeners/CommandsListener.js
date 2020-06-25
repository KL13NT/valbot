"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
const { GENERIC_COMMAND_NOT_UNDERSTOOD, ERROR_COMMAND_DOES_NOT_EXIST } = require('../config/events.json');
class CommandsListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onCommand = (message) => {
            const { content } = message;
            const commandRegex = RegExp(`${this.client.prefix}\\s+([a-zA-Z؀-ۿ]+)(\\s+)?`);
            const matchGroup = content.match(commandRegex);
            if (matchGroup === null) {
                message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD);
                return;
            }
            const [, commandName] = matchGroup;
            const command = this.client.commands.get(commandName);
            if (command === undefined)
                message.reply(ERROR_COMMAND_DOES_NOT_EXIST);
            else
                command.run(message);
        };
        this.events.set('ready', this.onCommand);
    }
}
exports.default = CommandsListener;
