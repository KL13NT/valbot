import { Command } from '../structures';
import { log } from '../utils/general';
import ValClient from '../ValClient';
import { CommandContext } from '../structures';
import { MongoController } from '../controllers';
import { createEmbed } from '../utils/embed';
import { getMemberObject } from '../utils/object';

export default class Leaderboard extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'leaderboard',
			category: 'Support',
			cooldown: 1000,
			nOfParams: 0,
			description: 'بتشوف مستوى اول عشر أشخاص',
			exampleUsage: '<user_id>',
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_VERIFIED'
			}
		});
	}

	_run = async ({ message }: CommandContext) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		try {
			const res = await mongo.db
				.collection('levels')
				.find({})
				.limit(10)
				.sort({ level: -1 })
				.toArray();
			const mapArr = res.map(element => ({
				name: `${getMemberObject(this.client, element.id).displayName}`,
				value: `Level: ${element.level}\nEXP: ${element.exp}`
			}));
			const msg = createEmbed({
				title: 'Top 10',
				fields: mapArr
			});
			message.reply(msg);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
