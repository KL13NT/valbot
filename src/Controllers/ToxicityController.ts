const { CLIENT_ID } = process.env;

import toxicity, { ToxicityClassifier } from '@tensorflow-models/toxicity';
import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { Message } from 'discord.js';

const { warn, mute, isWarned } = require('../utils/moderation');
const { log } = require('../utils/general');

export default class ToxicityController extends Controller {
	ready: boolean = false;
	labels: string[] = [];
	threshold: number = 0.7;
	confidence: number = 0.95;
	classifier: ToxicityClassifier;

	constructor(client: ValClient) {
		super(client, {
			name: 'toxicity'
		});

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
			toxicity.load(this.threshold, this.labels).then(model => {
				this.classifier = model;
				this.ready = true;

				log(client, 'ToxicityController loaded successfully', 'info');
			});
	}

	classify = async (message: Message) => {
		if (!this.ready) return false;

		const { content: sentence } = message;
		const predictions = await this.classifier.classify([sentence]);

		return predictions.reduce(
			(result, curr) =>
				curr.results[0].match === true &&
				curr.results[0].probabilities[1] > this.confidence
					? true
					: false,
			false
		);
	};

	handleToxic = async (message: Message) => {
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
		} else {
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
}
