"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { AUTH_TOKEN, MODE } = process.env;
const discord_js_1 = require("discord.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const loaders_1 = __importDefault(require("./loaders"));
const listeners_1 = __importDefault(require("./listeners"));
const general_1 = require("./utils/general");
class ValClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.init = (token = AUTH_TOKEN) => {
            try {
                this.login(token);
                this.initLoaders();
                this.initConfig();
                this.initListeners();
                console.log(fs
                    .readFileSync(path.resolve(__dirname, './media/bigtitle.txt'), 'utf8')
                    .toString());
            }
            catch (err) {
                general_1.log(this, `Something went wrong when initiating ValClient. Fix it and try again. Automatically retrying ${err.message}`, 'error');
            }
        };
        this.setPresence = () => {
            const presence = {
                message: `${this.prefix} help`,
                type: 'PLAYING'
            };
            general_1.log(this, `Current presence: ${presence.type} ${presence.message}`, 'info');
            if (this.user)
                this.user
                    .setActivity(presence.message, { type: presence.type })
                    .catch(err => general_1.log(this, err.message, 'error'));
        };
        this.initLoaders = () => {
            general_1.log(this, 'Loaders loading', 'info');
            for (const loader in loaders_1.default) {
                new loaders_1.default[loader](this).load();
            }
            general_1.log(this, 'All loaders loaded successfully', 'info');
        };
        this.initListeners = () => {
            general_1.log(this, 'Listeners loading', 'info');
            for (const listener in listeners_1.default) {
                new listeners_1.default[listener](this).init();
            }
            general_1.log(this, 'All listeners loaded successfully', 'info');
        };
        this.initConfig = async () => {
            try {
                if (this.controllers.mongo.ready && this.controllers.redis.ready) {
                    const response = await this.controllers.mongo.db
                        .collection('config')
                        .findOne({
                        GUILD_ID: process.env.GUILD_ID
                    });
                    if (!response)
                        return general_1.log(this, `The bot is not setup. Commands won't work. Call ${this.prefix} setup`, 'warn');
                    this.ready = true;
                    this.config = response;
                }
                else {
                    this.controllers.queue.enqueue(this.initConfig);
                }
            }
            catch (err) {
                const message = `Something went wrong when initialising ConfigController, ${err.message}`;
                general_1.log(this, message, 'error');
            }
        };
        this.ready = false;
        this.prefix = MODE === 'DEVELOPMENT' ? 'vd!' : 'v!';
        this.controllers = new Map();
    }
}
exports.default = ValClient;
