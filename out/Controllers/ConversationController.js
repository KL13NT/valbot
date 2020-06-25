"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../structures/Controller"));
const { log } = require('../utils/general');
class ConversationController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'conversation'
        });
        this.ready = false;
        this.responses = {};
        this.init = async () => {
            try {
                const mongo = this.client.controllers.get('mongo');
                const queue = this.client.controllers.get('queue');
                if (mongo.ready) {
                    const responses = await mongo.getResponses();
                    responses.forEach(({ invoker, reply }) => {
                        this.responses[invoker] = {
                            invoker,
                            reply
                        };
                    });
                }
                else {
                    queue.enqueue(this.init);
                }
            }
            catch (err) {
                const message = `Something went wrong when initialising ConversationController, ${err.message}`;
                log(this.client, message, 'error');
            }
        };
        this.converse = async (message, isClientMentioned) => {
            const response = Object.values(this.responses).find(response => new RegExp(`${response.invoker}`, 'gi').test(message.content));
            if (response) {
                message.reply(response.reply);
            }
            else if (isClientMentioned)
                message.reply(`لو محتاجين مساعدة تقدروا تكتبوا \`${this.client.prefix} help\``);
        };
        this.init();
    }
    async teach(response) {
        const mongo = this.client.controllers.get('mongo');
        const queue = this.client.controllers.get('queue');
        this.responses[response.invoker] = response;
        if (mongo.ready)
            mongo.saveResponse(response);
        else
            queue.enqueue(this.teach, response);
    }
    getAllResponses() {
        return this.responses;
    }
}
exports.default = ConversationController;
