"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { CLIENT_ID } = process.env;
const toxicity_1 = __importDefault(require("@tensorflow-models/toxicity"));
const Controller_1 = __importDefault(require("../structures/Controller"));
const { warn, mute, isWarned } = require('../utils/moderation');
const { log } = require('../utils/general');
class ToxicityController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'toxicity'
        });
        this.ready = false;
        this.labels = [];
        this.threshold = 0.7;
        this.confidence = 0.95;
        this.classify = async (message) => {
            if (!this.ready)
                return false;
            const { content: sentence } = message;
            const predictions = await this.classifier.classify([sentence]);
            return predictions.reduce((result, curr) => curr.results[0].match === true &&
                curr.results[0].probabilities[1] > this.confidence
                ? true
                : false, false);
        };
        this.handleToxic = async (message) => {
            const { author, channel } = message;
            const reason = 'Used toxic language';
            if (isWarned(this.client, author.id)) {
                await message.reply('دي تاني مرة تقل ادبك. ادي اخرتها. mute.');
                await mute(this.client, {
                    member: author.id,
                    moderator: CLIENT_ID,
                    channel: channel.id,
                    reason
                });
                message.delete({ reason });
            }
            else {
                await message.reply('متبقوش توكسيك. ده تحذير, المره الجاية mute.');
                await warn(this.client, {
                    member: author.id,
                    moderator: CLIENT_ID,
                    channel: channel.id,
                    reason
                });
                message.delete({ reason });
            }
        };
        this.labels = [
            'identity_attack',
            'severe_toxicity',
            'threat',
            'insult',
            'obscene',
            'sexual_explicit',
            'toxicity'
        ];
        if (process.env.MODE !== 'DEVELOPMENT')
            toxicity_1.default.load(this.threshold, this.labels).then(model => {
                this.classifier = model;
                this.ready = true;
                log(client, 'ToxicityController loaded successfully', 'info');
            });
    }
}
exports.default = ToxicityController;
