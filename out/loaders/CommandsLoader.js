"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Loader_1 = __importDefault(require("../structures/Loader"));
const general_1 = require("../utils/general");
class CommandsLoader extends Loader_1.default {
    constructor(client) {
        super(client);
        this.load = () => {
            general_1.log(this.client, 'Commands loaded successfully', 'info');
        };
    }
}
exports.default = CommandsLoader;
