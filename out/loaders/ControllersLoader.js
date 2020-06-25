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
const Controllers = __importStar(require("../Controllers"));
const general_1 = require("../utils/general");
class ControllersLoader extends Loader_1.default {
    constructor(client) {
        super(client);
        this.load = () => {
            Object.values(Controllers).forEach(controller => {
                const controllerInstance = new controller(this.client);
                this.client.controllers.set(controllerInstance.options.name, controllerInstance);
                general_1.log(this.client, `${controllerInstance.options.name} loaded`, 'info');
            });
        };
    }
}
exports.default = ControllersLoader;
