"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../structures/Controller"));
const general_1 = require("../utils/general");
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
                    this.ready = true;
                }
                else {
                    queue.enqueue({ func: this.init, args: [] });
                }
            }
            catch (err) {
                general_1.log(this.client, err, 'error');
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
            queue.enqueue({ func: this.teach, args: [response] });
    }
    getAllResponses() {
        return this.responses;
    }
}
exports.default = ConversationController;
