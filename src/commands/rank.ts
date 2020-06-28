import { Command } from '../structures';
import { generateRankCard } from '../utils/svg';
import { log } from '../utils/general';
import { getMemberObject } from '../utils/object';
import ValClient from '../ValClient';
import { CommandContext } from '../structures';
import { MongoController, RedisController } from '../Controllers';

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

	_run = async ({ message, params, member: ctxMember }: CommandContext) => {
		try {
			const mongo = <MongoController>this.client.controllers.get('mongo');
			const redis = <RedisController>this.client.controllers.get('redis');
			const [userMention] = params;

			const id = userMention
				? userMention.replace(/<|>|!|@/g, '')
				: ctxMember.user.id;

			if (id === process.env.CLIENT_ID || id === process.env.CLIENT_DEV_ID) {
				await message.reply('متكترش هزار عشان ميتعملش عليك صريخ ضحك :"D');
				return;
			}

			const member = getMemberObject(this.client, id);

			const res = await mongo.getLevel(id);
			const avatar_url = member.user.displayAvatarURL();
			const displayName = member.user.username.substr(0, 12) + '...';
			const displayID = member.user.tag.split('#')[1];

			const voice = res ? res.voice : await redis.get(`VOICE:${id}`);
			const text = res ? res.text : await redis.get(`TEXT:${id}`);
			const exp = await redis.get(`EXP:${id}`);
			const level = await redis.get(`LEVEL:${id}`);

			const userInfo = {
				avatar_url,
				displayName,
				USER_ID: displayID
			};
			const levelInfo = {
				exp: Number(exp) || 1,
				text: Number(text) || 1,
				voice: Number(voice) || 1,
				level: Number(level) || 1,
				levelEXP: 60 * Number(level) * 0.1 + 60 || 1
			};

			const card = await generateRankCard(userInfo, levelInfo);
			await message.reply("Here's the requested rank", {
				files: [
					{
						attachment: card
					}
				]
			});
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
