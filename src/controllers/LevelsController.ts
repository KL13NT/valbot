import Controller from "../structures/Controller";
import ValClient from "../ValClient";
import { Snowflake, Message, GuildMember, Role } from "discord.js";
import { MilestoneAchievement } from "../types/interfaces";
import {
	QueueController,
	RedisController,
	MongoController,
	IntervalsController,
} from ".";

import {
	calculateUniqueWords,
	notify,
	calculateNextLevel,
	/* levelToExp */
} from "../utils/general";
import { getRoleObject, getMemberObject } from "../utils/object";
import { createLevelupEmbed } from "../utils/embed";
import logger from "../utils/logging";

const XP_PER_MINUTE = 4;

export default class LevelsController extends Controller {
	ready = false;
	activeVoice: Snowflake[] = [];
	milestones: Map<string, MilestoneAchievement[]> = new Map<
		string,
		MilestoneAchievement[]
	>();

	constructor(client: ValClient) {
		super(client, {
			name: "levels",
		});
	}

	init = async () => {
		const { controllers, ValGuild } = this.client;
		const redis = <RedisController>controllers.get("redis");
		const mongo = <MongoController>controllers.get("mongo");
		const intervals = <IntervalsController>controllers.get("intervals");
		const queue = <QueueController>controllers.get("queue");

		//REFACTORME: SPLIT THIS MESS INTO SINGLE-PURPOSE FUNCTIONS YA BELLEND
		if (!mongo.ready || !redis.ready || !ValGuild.available)
			return queue.enqueue({ func: this.init, args: [] });

		const voiceStates = Array.from(
			this.client.ValGuild.voiceStates.cache.values(),
		);

		voiceStates.forEach(({ deaf, mute, member, channel }) => {
			if (
				//TODO: move this to config
				channel.id === "571721579214667786" ||
				member.user.bot ||
				deaf ||
				mute
			)
				return;

			this.activeVoice.push(member.id);
		});

		mongo.getLevels().then(async levels => {
			levels.forEach(async ({ id, text, voice, level, textXP, voiceXP }) => {
				// (value || 1) to handle old mongo documents that didn't have some props
				await Promise.all([
					redis.set(`TEXT:${id}`, String(text || 1)),
					redis.set(`TEXT:XP:${id}`, String(textXP || 1)),
					redis.set(`VOICE:${id}`, String(voice || 1)),
					redis.set(`VOICE:XP:${id}`, String(voiceXP || 1)),
					redis.set(`LEVEL:${id}`, String(level || 1)),
					redis.set(`EXP:${id}`, String(level || 1)),
				]);
			});

			intervals.set({
				time: 1000 * 60,
				name: "voiceIncrement",
				callback: this.voiceIncrement,
			});
		});

		mongo.getMilestones().then(levels => {
			levels.forEach(level => {
				this.milestones.set(String(level.level), level.milestones);
			});
		});
	};

	message = async (message: Message) => {
		const redis = <RedisController>this.client.controllers.get("redis");

		const { author, content } = message;
		const { id, bot } = author;

		if (id === this.client.user.id || bot) return;

		try {
			const cache = await Promise.all([
				redis.get(`TEXT:XP:${id}`),
				redis.get(`TEXT:${id}`),
				redis.get(`LEVEL:${id}`),
				redis.get(`EXP:${id}`),
			]);

			const [textXP, text, level, exp] = cache.map(val => Number(val));

			const gain =
				calculateUniqueWords(content) > 10
					? 10
					: calculateUniqueWords(content); /* limit */

			if (exp) {
				const nextText = calculateNextLevel(textXP + gain);
				const nextLevel = calculateNextLevel(exp + gain);

				if (nextText > text) {
					await Promise.all([
						redis.set(`TEXT:${id}`, String(nextText)),
						redis.set(`TEXT:XP:${id}`, String(1)),
					]);
				} else {
					await Promise.all([
						redis.incrby(`EXP:${id}`, gain),
						redis.incrby(`TEXT:XP:${id}`, gain),
					]);
				}

				if (nextLevel > level) {
					await Promise.all([
						redis.set(`LEVEL:${id}`, String(nextLevel)),
						redis.set(`EXP:${id}`, String(1)),
					]);

					await this.levelUp(message);
				}
			} else this.initUser(id);
		} catch (err) {
			logger.error(err);
		}
	};

	voiceIncrement = async () => {
		const redis = <RedisController>this.client.controllers.get("redis");

		this.activeVoice.forEach(async id => {
			try {
				const cache = await Promise.all([
					redis.get(`VOICE:XP:${id}`),
					redis.get(`VOICE:${id}`),
					redis.get(`LEVEL:${id}`),
					redis.get(`EXP:${id}`),
				]);
				const [voiceXP, voice, level, exp] = cache.map(val => Number(val));

				const gain = XP_PER_MINUTE;

				if (exp) {
					const nextVoice = calculateNextLevel(voiceXP + gain);
					const nextLevel = calculateNextLevel(exp + gain);

					if (nextVoice > voice) {
						await Promise.all([
							redis.set(`VOICE:${id}`, String(nextVoice)),
							redis.set(`VOICE:XP:${id}`, String(1)),
						]);
					} else {
						await Promise.all([
							redis.incrby(`EXP:${id}`, gain),
							redis.incrby(`VOICE:XP:${id}`, gain),
						]);
					}

					if (nextLevel > level) {
						await Promise.all([
							redis.set(`LEVEL:${id}`, String(nextLevel)),
							redis.set(`EXP:${id}`, String(1)),
						]);

						await this.levelUp(id);
					}
				} else this.initUser(id);
			} catch (err) {
				logger.error(err);
			}
		});
	};

	initUser = async (id: Snowflake) => {
		const redis = <RedisController>this.client.controllers.get("redis");

		await Promise.all([
			redis.set(`EXP:${id}`, String(1)),
			redis.set(`LEVEL:${id}`, String(1)),
			redis.set(`TEXT:XP:${id}`, String(1)),
			redis.set(`TEXT:${id}`, String(1)),
			redis.set(`VOICE:XP:${id}`, String(1)),
			redis.set(`VOICE:${id}`, String(1)),
		]);

		await this.levelUp(id);
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
		const redis = <RedisController>controllers.get("redis");
		const mongo = <MongoController>controllers.get("mongo");

		const id =
			typeof messageOrId === "string" ? messageOrId : messageOrId.member.id;

		const cache = await Promise.all([
			redis.get(`EXP:${id}`),
			redis.get(`LEVEL:${id}`),
			redis.get(`VOICE:XP:${id}`),
			redis.get(`VOICE:${id}`),
			redis.get(`TEXT:XP:${id}`),
			redis.get(`TEXT:${id}`),
		]);

		const [exp, level, voiceXP, voice, textXP, text] = cache.map(val =>
			Number(val),
		);

		await mongo.syncLevels(id, {
			id,
			exp,
			text,
			voice,
			level,
			textXP,
			voiceXP,
		});

		await this.enforceMilestone(level, id);
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
						role,
					});

					member.roles.add(role.id);
					await notify({
						client: this.client,
						notification: `<@${id}>`,
						embed,
					});
				} catch (err) {
					logger.error(err);
				}
			});
		}
	};

	addMilestone = async (
		level: number,
		name: string,
		description: string,
		roleID: Snowflake,
	) => {
		const mongo = <MongoController>this.client.controllers.get("mongo");
		const milestone = this.milestones.get(String(level));
		const newMilestone = {
			name,
			roleID,
			description,
			level,
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

		await mongo.db.collection("milestones").updateOne(
			{
				level,
			},
			{
				$push: { milestones: newMilestone },
			},
			{
				upsert: true,
			},
		);
	};

	getMilestone = (level: number) => {
		return this.milestones.get(String(level));
	};

	removeMilestone = async (level: number, name: string) => {
		const mongo = <MongoController>this.client.controllers.get("mongo");
		const milestone = this.milestones.get(String(level));

		if (milestone) {
			const ach = milestone.findIndex(ach => ach.name === name);

			delete this.milestones.get(String(level))[ach];

			if (Object.keys(milestone).length === 0) {
				this.milestones.delete(String(level));
				mongo.db.collection("milestones").deleteOne({ level });
			} else
				mongo.db.collection("milestones").updateOne(
					{
						level,
					},
					{
						$pull: { milestones: { name: name } },
					},
				);
		}
	};
}
