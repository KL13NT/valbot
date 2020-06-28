import { Command } from '../structures';
import { generateRankCard } from '../utils/svg';
import { log } from '../utils/general';
import { getMemberObject } from '../utils/object';
import ValClient from '../ValClient';
import { CommandContext } from '../structures';
import { MongoController, RedisController } from '../Controllers';
import { Snowflake } from 'discord.js';

export default class Rank extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'rank',
			category: 'Support',
			cooldown: 1000,
			nOfParams: 0,
			description: 'بتشوف مستوى شخص ما',
			exampleUsage: '<user_id>',
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_VERIFIED'
			}
		});
	}

	_run = async ({ message, params, member }: CommandContext) => {
		const [userMention] = params;
		const id = userMention
			? userMention.replace(/<|>|!|@/g, '')
			: member.user.id;

		try {
			if (id === process.env.CLIENT_ID || id === process.env.CLIENT_DEV_ID) {
				await message.reply('متكترش هزار عشان ميتعملش عليك صريخ ضحك :"D');
				return;
			}

			const levelInfo = await this.getLevels(id);
			const userInfo = this.getUserInfo(id);

			const card = await generateRankCard(userInfo, levelInfo);
			await message.reply("Here's the requested rank", {
				files: [
					{
						attachment: card,
						name: `Rank Card`
					}
				]
			});
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	getUserInfo = (id: Snowflake) => {
		const target = getMemberObject(this.client, id);

		const avatar_url = target.user.displayAvatarURL();
		const displayName = target.user.username.substr(0, 12) + '...';
		const USER_ID = target.user.tag.split('#')[1];

		return {
			avatar_url,
			displayName,
			USER_ID
		};
	};

	getLevels = async (id: Snowflake) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const redis = <RedisController>this.client.controllers.get('redis');

		const res = await mongo.getLevel(id);

		const voice: number | string = res
			? res.voice
			: await redis.get(`VOICE:${id}`);
		const text: number | string = res
			? res.text
			: await redis.get(`TEXT:${id}`);

		const exp: number | string = await redis.get(`EXP:${id}`);
		const level: number | string = await redis.get(`LEVEL:${id}`);

		return {
			voice: Number(voice) || 1,
			text: Number(text) || 1,
			exp: Number(exp) || 1,
			level: Number(level) || 1,
			levelEXP: 60 * Number(level) * 0.1 + 60
		};
	};
}
