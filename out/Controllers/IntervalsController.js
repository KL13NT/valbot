"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../structures/Controller"));
class IntervalsController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'intervals'
        });
        this.ready = false;
        this.ready = true;
        this.intervals = new Map();
    }
    setInterval(intervalOptions) {
        const { name, time, callback } = intervalOptions;
        if (this.exists(name))
            this.clearInterval(name);
        this.intervals.set(name, setInterval(callback, time));
    }
    clearInterval(name) {
        clearInterval(this.intervals.get(name));
        this.intervals.delete(name);
    }
    exists(name) {
        return this.intervals.has(name);
    }
}
exports.default = IntervalsController;
