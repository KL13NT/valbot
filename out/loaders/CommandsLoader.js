"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Loader_1 = __importDefault(require("../structures/Loader"));
const commands = __importStar(require("../commands"));
const { log } = require('../utils/general');
class CommandsLoader extends Loader_1.default {
    constructor(client) {
        super(client);
        this.load = () => {
            commands.forEach((command) => {
                const newCommand = new command(this.client);
                this.client.commands.set(newCommand.options.name, newCommand);
            });
            log(this.client, 'Commands loaded successfully', 'info');
        };
    }
}
exports.default = CommandsLoader;
