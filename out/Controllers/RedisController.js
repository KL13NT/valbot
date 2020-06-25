"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../structures/Controller"));
const util_1 = require("util");
const redis_1 = __importDefault(require("redis"));
const general_1 = require("../utils/general");
class RedisController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'redis'
        });
        this.ready = false;
        this.getAsync = util_1.promisify(this.redis.get).bind(this.redis);
        this.setAsync = util_1.promisify(this.redis.set).bind(this.redis);
        this.incrAsync = util_1.promisify(this.redis.incr).bind(this.redis);
        this.incrbyAsync = util_1.promisify(this.redis.incrby).bind(this.redis);
        this.errorListener = (err) => {
            general_1.log(this.client, err, 'error');
            this.redis.removeAllListeners();
            this.ready = false;
        };
        this.readyListener = () => {
            general_1.log(this.client, 'Redis ready', 'info');
            this.client.emit('queueExecute', 'Redis controller ready');
            this.ready = true;
            this.redis.removeListener('ready', this.readyListener);
        };
        this.set = (key, value) => {
            return this.setAsync(key, value);
        };
        this.get = (key) => {
            return this.getAsync(key);
        };
        this.incr = (key) => {
            if (this.redis.exists(key))
                return this.incrAsync(key);
            else
                throw Error('Key not found');
        };
        this.incrby = (key, by) => {
            if (this.redis.exists(key))
                return this.incrbyAsync(key, by);
            else
                throw Error('Key not found');
        };
        this.ready = false;
        this.redis = redis_1.default.createClient(process.env.REDIS_URL);
        this.redis.on('ready', this.readyListener);
        this.redis.on('error', this.errorListener);
    }
}
exports.default = RedisController;
