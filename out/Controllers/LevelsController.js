"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { CLIENT_ID } = process.env;
const Controller_1 = __importDefault(require("../structures/Controller"));
const general_1 = require("../utils/general");
const object_1 = require("../utils/object");
const embed_1 = require("../utils/embed");
class LevelsController extends Controller_1.default {
    constructor(client) {
        super(client, {
            name: 'levels'
        });
        this.ready = false;
        this.activeVoice = [];
        this.milestones = new Map();
        this.init = () => {
            const { controllers, ValGuild } = this.client;
            const redis = controllers.get('redis');
            const mongo = controllers.get('mongo');
            const intervals = controllers.get('intervals');
            const queue = controllers.get('queue');
            if (!mongo.ready || !redis.ready || !ValGuild.available)
                return queue.enqueue({ func: this.init, args: [] });
            const voiceStates = Array.from(this.client.ValGuild.voiceStates.cache.values());
            voiceStates.forEach(({ deaf, mute, member, channel }) => {
                if (channel.id === '571721579214667786' ||
                    member.user.bot ||
                    deaf ||
                    mute)
                    return;
                this.activeVoice.push(member.id);
            });
            mongo.getLevels().then(async (levels) => {
                levels.forEach(({ id, text, voice, level, textXP, voiceXP }) => {
                    redis.set(`TEXT:${id}`, String(text || 1));
                    redis.set(`TEXT:XP:${id}`, String(textXP || 1));
                    redis.set(`VOICE:${id}`, String(voice || 1));
                    redis.set(`VOICE:XP:${id}`, String(voiceXP || 1));
                    redis.set(`LEVEL:${id}`, String(level || 1));
                });
                intervals.setInterval({
                    time: 1000 * 60,
                    name: 'voiceIncrement',
                    callback: this.voiceIncrement
                });
            });
            mongo.getMilestones().then(milestones => {
                milestones.forEach(milestone => {
                    if (!this.milestones.has(milestone.level))
                        this.milestones.set(milestone.level, []);
                    this.milestones.get(milestone.level).push(milestone);
                });
            });
        };
        this.message = async (message) => {
            const redis = this.client.controllers.get('redis');
            const { author, content } = message;
            const { id, bot } = author;
            if (id === CLIENT_ID || bot)
                return;
            try {
                const textXP = Number(await redis.get(`TEXT:XP:${id}`));
                const text = Number(await redis.get(`TEXT:${id}`));
                const level = Number(await redis.get(`LEVEL:${id}`));
                const exp = Number(await redis.get(`EXP:${id}`));
                const gainedWords = Math.ceil(general_1.calculateUniqueWords(content) * 0.4);
                if (exp) {
                    const nextText = Math.floor((textXP + gainedWords) / 6 - 60);
                    const textIncrBy = nextText - text <= 0 ? 1 : nextText - text;
                    const nextLevel = Math.floor((exp + gainedWords) / 6 - 60);
                    const levelIncrBy = nextLevel - level <= 0 ? 1 : nextLevel - level;
                    if (exp + gainedWords >= 60 * Number(level) * 0.1 + 60) {
                        redis.incrby(`LEVEL:${id}`, levelIncrBy);
                        redis.set(`EXP:${id}`, String(1));
                        this.levelUp(message);
                    }
                    if (textXP + gainedWords >= 60 * Number(text) * 0.1 + 60) {
                        redis.incrby(`TEXT:${id}`, textIncrBy);
                        redis.set(`TEXT:EXP:${id}`, String(1));
                    }
                    else {
                        redis.incrby(`EXP:${id}`, gainedWords);
                        redis.incrby(`TEXT:XP:${id}`, gainedWords);
                    }
                }
                else
                    this.initUser(id);
            }
            catch (err) {
                general_1.log(this.client, err, 'error');
            }
        };
        this.voiceIncrement = async () => {
            const redis = this.client.controllers.get('redis');
            this.activeVoice.forEach(async (id) => {
                try {
                    const voiceXP = Number(await redis.get(`VOICE:XP:${id}`));
                    const voice = Number(await redis.get(`VOICE:${id}`));
                    const level = Number(await redis.get(`LEVEL:${id}`));
                    const exp = Number(await redis.get(`EXP:${id}`));
                    const XP_PER_MINUTE = 4;
                    if (exp) {
                        const nextVoice = Math.floor((voiceXP + XP_PER_MINUTE) / 6 - 60);
                        const voiceIncrBy = nextVoice - voice <= 0 ? 1 : nextVoice - voice;
                        const nextLevel = Math.floor((exp + XP_PER_MINUTE) / 6 - 60);
                        const levelIncrBy = nextLevel - voice <= 0 ? 1 : nextLevel - voice;
                        if (exp + XP_PER_MINUTE >= 60 * Number(level) * 0.1 + 60) {
                            redis.incrby(`LEVEL:${id}`, levelIncrBy);
                            redis.set(`EXP:${id}`, String(1));
                            this.levelUp(id);
                        }
                        if (voiceXP + XP_PER_MINUTE >= 60 * Number(voice) * 0.1 + 60) {
                            redis.incrby(`VOICE:${id}`, voiceIncrBy);
                            redis.set(`VOICE:XP:${id}`, String(1));
                        }
                        else {
                            redis.incrby(`EXP:${id}`, XP_PER_MINUTE);
                            redis.incrby(`VOICE:XP:${id}`, XP_PER_MINUTE);
                        }
                    }
                    else
                        this.initUser(id);
                }
                catch (err) {
                    general_1.log(this.client, err, 'error');
                }
            });
        };
        this.initUser = async (id) => {
            const redis = this.client.controllers.get('redis');
            redis.set(`EXP:${id}`, String(1));
            redis.set(`LEVEL:${id}`, String(1));
            redis.set(`TEXT:XP:${id}`, String(1));
            redis.set(`TEXT:${id}`, String(1));
            redis.set(`VOICE:XP:${id}`, String(1));
            redis.set(`VOICE:${id}`, String(1));
            this.levelUp(id);
        };
        this.levelUp = async (messageOrId) => {
            const { controllers } = this.client;
            const redis = controllers.get('redis');
            const mongo = controllers.get('mongo');
            const id = typeof messageOrId === 'string' ? messageOrId : messageOrId.member.id;
            const exp = Number(await redis.get(`EXP:${id}`));
            const level = Number(await redis.get(`LEVEL:${id}`));
            const voiceXP = Number(await redis.get(`VOICE:XP:${id}`));
            const voice = Number(await redis.get(`VOICE:${id}`));
            const textXP = Number(await redis.get(`TEXT:XP:${id}`));
            const text = Number(await redis.get(`TEXT:${id}`));
            mongo.syncLevels(id, {
                id,
                exp,
                text,
                voice,
                level,
                textXP,
                voiceXP
            });
            this.enforceMilestone(level, id);
            this.levelUpMessage(id, level);
        };
        this.init();
    }
    trackUser(id) {
        const index = this.activeVoice.indexOf(id);
        if (index === -1)
            this.activeVoice.push(id);
    }
    untrackUser(id) {
        const index = this.activeVoice.indexOf(id);
        if (index !== -1)
            this.activeVoice.splice(index, 1);
    }
    async enforceMilestone(userLevel, id) {
        if (this.milestones.has(userLevel)) {
            const milestones = this.milestones.get(userLevel);
            const member = object_1.getMemberObject(this.client, id);
            milestones.forEach(async (milestone) => {
                try {
                    const role = object_1.getRoleObject(this.client, milestone.roleID);
                    const embed = embed_1.createLevelupEmbed({ milestone, role });
                    member.roles.add(role.id);
                    general_1.notify({
                        client: this.client,
                        notification: `<@${id}>`,
                        embed
                    });
                }
                catch (err) {
                    general_1.log(this.client, err, 'error');
                }
            });
        }
    }
    async levelUpMessage(id, level) {
        const notification = `GG <@${id}>, you just advanced to level ${level}! :fireworks: <:PutinWaves:668209208113627136>`;
        general_1.notify({ client: this.client, notification });
    }
    addMilestone(level, name, description, roleID) {
        const mongo = this.client.controllers.get('mongo');
        const milestone = this.milestones.get(level);
        const newMilestone = {
            name,
            roleID,
            description,
            level
        };
        if (milestone) {
            if (milestone.find(mile => mile.roleID === roleID || mile.name === name))
                return;
            else {
                milestone.push(newMilestone);
            }
        }
        else {
            this.milestones.set(level, [newMilestone]);
        }
        mongo.db.collection('milestones').updateOne({
            level
        }, {
            $push: { milestones: newMilestone }
        }, {
            upsert: true
        });
    }
    getMilestone(level) {
        return this.milestones.get(level);
    }
    async removeMilestone(level, name) {
        const mongo = this.client.controllers.get('mongo');
        const milestone = this.milestones.get(level);
        if (milestone) {
            const ach = milestone.findIndex(ach => ach.name === name);
            delete this.milestones.get(level)[ach];
            if (Object.keys(milestone).length === 0) {
                this.milestones.delete(level);
                mongo.db.collection('milestones').deleteOne({ level });
            }
            else
                mongo.db.collection('milestones').updateOne({
                    level
                }, {
                    $pull: { milestones: { name: name } }
                });
        }
    }
}
exports.default = LevelsController;
