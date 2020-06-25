"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../structures/Controller"));
class QueueController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'queue'
        });
        this.enqueue = (call) => {
            this.calls.push(call);
        };
        this.executeAll = () => {
            for (let i = this.calls.length - 1; i >= 0; i--) {
                this.calls[i].func.call(this, ...this.calls[i].args);
                this.calls.pop();
            }
        };
        this.ready = false;
        this.calls = [];
    }
}
exports.default = QueueController;
