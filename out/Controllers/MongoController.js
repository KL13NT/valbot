"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { DB_HOST, DB_NAME } = process.env;
const Controller_1 = __importDefault(require("../structures/Controller"));
const mongodb_1 = require("mongodb");
const general_1 = require("../utils/general");
class MongoController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'mongo'
        });
        this.ready = false;
        this.init = async () => {
            try {
                await this.mongo.connect();
                this.db = this.mongo.db(DB_NAME);
                if (typeof this.db !== 'undefined') {
                    this.ready = true;
                    this.client.emit('queueExecute', 'Mongo controller ready');
                }
            }
            catch (err) {
                general_1.log(this.client, err, 'error');
            }
        };
        this.syncLevels = async (id, levelToSync) => {
            const { exp, text, voice, level, textXP, voiceXP } = levelToSync;
            await this.db.collection('levels').updateOne({ id }, {
                $set: { exp, text, voice, level, textXP, voiceXP }
            }, {
                upsert: true
            });
        };
        this.getLevel = async (id) => {
            return this.db.collection('levels').findOne({ id });
        };
        this.getLevels = async () => {
            return this.db.collection('levels').find({}).toArray();
        };
        this.getMilestones = async () => {
            return this.db.collection('milestones').find({}).toArray();
        };
        this.getResponses = async () => {
            return this.db.collection('responses').find({}).toArray();
        };
        this.saveResponse = async ({ invoker, reply }) => {
            return this.db.collection('responses').updateOne({
                invoker
            }, {
                $set: {
                    invoker,
                    reply
                }
            }, {
                upsert: true
            });
        };
        this.mongo = new mongodb_1.MongoClient(DB_HOST, {
            useNewUrlParser: true
        });
        this.init();
    }
}
exports.default = MongoController;
