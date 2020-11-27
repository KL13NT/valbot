const { CLIENT_ID } = process.env;

import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { Snowflake, Message, GuildMember, Role } from 'discord.js';
import { MilestoneAchievement } from '../types/interfaces';
import {
	QueueController,
	RedisController,
	MongoController,
	IntervalsController
} from '.';

import { log, calculateUniqueWords, notify } from '../utils/general';
import { getRoleObject, getMemberObject } from '../utils/object';
import { createLevelupEmbed } from '../utils/embed';

export default class LevelsController extends Controller {
	ready = false;
	activeVoice: Snowflake[] = [];
	milestones: Map<string, MilestoneAchievement[]> = new Map<
		string,
		MilestoneAchievement[]
	>();

	constructor(client: ValClient) {
		super(client, {
			name: 'levels'
		});
	}

	init = async () => {
		const { controllers, ValGuild } = this.client;
		const redis = <RedisController>controllers.get('redis');
		const mongo = <MongoController>controllers.get('mongo');
		const intervals = <IntervalsController>controllers.get('intervals');
		const queue = <QueueController>controllers.get('queue');

		//REFACTORME: SPLIT THIS MESS INTO SINGLE-PURPOSE FUNCTIONS YA BELLEND
		if (!mongo.ready || !redis.ready || !ValGuild.available)
			return queue.enqueue({ func: this.init, args: [] });

		const voiceStates = Array.from(
			this.client.ValGuild.voiceStates.cache.values()
		);

		voiceStates.forEach(({ deaf, mute, member, channel }) => {
			if (
				//TODO: move this to config
				channel.id === '571721579214667786' ||
				member.user.bot ||
				deaf ||
				mute
			)
				return;

			this.activeVoice.push(member.id);
		});

		mongo.getLevels().then(async levels => {
			levels.forEach(({ id, text, voice, level, textXP, voiceXP }) => {
				// (value || 1) to handle old mongo documents that didn't have some props
				redis.set(`TEXT:${id}`, String(text || 1));
				redis.set(`TEXT:XP:${id}`, String(textXP || 1));
				redis.set(`VOICE:${id}`, String(voice || 1));
				redis.set(`VOICE:XP:${id}`, String(voiceXP || 1));
				redis.set(`LEVEL:${id}`, String(level || 1));
				redis.set(`EXP:${id}`, String(level || 1));
			});

			intervals.set({
				time: 1000 * 60,
				name: 'voiceIncrement',
				callback: this.voiceIncrement
			});
		});

		mongo.getMilestones().then(levels => {
			levels.forEach(level => {
				this.milestones.set(String(level.level), level.milestones);
			});
		});
	};

	message = async (message: Message) => {
		const redis = <RedisController>this.client.controllers.get('redis');

		const { author, content } = message;
		const { id, bot } = author;

		if (id === CLIENT_ID || bot) return;

		try {
			const textXP = Number(await redis.get(`TEXT:XP:${id}`));
			const text = Number(await redis.get(`TEXT:${id}`));

			const level = Number(await redis.get(`LEVEL:${id}`));
			const exp = Number(await redis.get(`EXP:${id}`));

			const gainedWords = calculateUniqueWords(content);

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
				} else {
					redis.incrby(`EXP:${id}`, gainedWords);
					redis.incrby(`TEXT:XP:${id}`, gainedWords);
				}
			} else this.initUser(id);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	voiceIncrement = async () => {
		const redis = <RedisController>this.client.controllers.get('redis');

		this.activeVoice.forEach(async id => {
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
					} else {
						redis.incrby(`EXP:${id}`, XP_PER_MINUTE);
						redis.incrby(`VOICE:XP:${id}`, XP_PER_MINUTE);
					}
				} else this.initUser(id);
			} catch (err) {
				log(this.client, err, 'error');
			}
		});
	};

	initUser = async (id: Snowflake) => {
		const redis = <RedisController>this.client.controllers.get('redis');

		redis.set(`EXP:${id}`, String(1));
		redis.set(`LEVEL:${id}`, String(1));
		redis.set(`TEXT:XP:${id}`, String(1));
		redis.set(`TEXT:${id}`, String(1));
		redis.set(`VOICE:XP:${id}`, String(1));
		redis.set(`VOICE:${id}`, String(1));

		this.levelUp(id);
	};

	trackUser = (id: Snowflake) => {
		const index = this.activeVoice.indexOf(id);

		if (index === -1) this.activeVoice.push(id);
	};

	untrackUser = (id: Snowflake) => {
		const index = this.activeVoice.indexOf(id);

		if (index !== -1) this.activeVoice.splice(index, 1);
	};

	levelUp = async (messageOrId: Message | Snowflake) => {
		const { controllers } = this.client;
		const redis = <RedisController>controllers.get('redis');
		const mongo = <MongoController>controllers.get('mongo');

		const id =
			typeof messageOrId === 'string' ? messageOrId : messageOrId.member.id;

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

	enforceMilestone = async (userLevel: number, id: Snowflake) => {
		if (this.milestones.has(String(userLevel))) {
			const achievements = this.milestones.get(String(userLevel));
			const member: GuildMember = getMemberObject(this.client, id);

			achievements.forEach(async achievement => {
				try {
					const role: Role = getRoleObject(this.client, achievement.roleID);
					const embed = createLevelupEmbed({
						milestone: achievement,
						role
					});

					member.roles.add(role.id);
					notify({
						client: this.client,
						notification: `<@${id}>`,
						embed
					});
				} catch (err) {
					log(this.client, err, 'error');
				}
			});
		}
	};

	levelUpMessage = async (id: Snowflake, level: number) => {
		const member = getMemberObject(this.client, id);
		const mention =
			typeof member === 'undefined' ? `<@${id}>` : `${member.displayName}`;

		const notification = `GG ${mention}, you just advanced to level ${level}! :fireworks: <:PutinWaves:668209208113627136>`;

		notify({ client: this.client, notification });
	};

	addMilestone = async (
		level: number,
		name: string,
		description: string,
		roleID: Snowflake
	) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const milestone = this.milestones.get(String(level));
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
		} else {
			this.milestones.set(String(level), [newMilestone]);
		}

		await mongo.db.collection('milestones').updateOne(
			{
				level
			},
			{
				$push: { milestones: newMilestone }
			},
			{
				upsert: true
			}
		);
	};

	getMilestone = (level: number) => {
		return this.milestones.get(String(level));
	};

	removeMilestone = async (level: number, name: string) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const milestone = this.milestones.get(String(level));

		if (milestone) {
			const ach = milestone.findIndex(ach => ach.name === name);

			delete this.milestones.get(String(level))[ach];

			if (Object.keys(milestone).length === 0) {
				this.milestones.delete(String(level));
				mongo.db.collection('milestones').deleteOne({ level });
			} else
				mongo.db.collection('milestones').updateOne(
					{
						level
					},
					{
						$pull: { milestones: { name: name } }
					}
				);
		}
	};
}
