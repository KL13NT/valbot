import { Message } from "discord.js";
import { ToxicityClassifier, load } from "@tensorflow-models/toxicity";

import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import { warn, mute, isWarned } from "../utils/moderation";
import { log } from "../utils/general";

export default class ToxicityController extends Controller {
	ready = false;
	labels: string[] = [];
	threshold = 0.7;
	confidence = 0.95;
	classifier: ToxicityClassifier;

	constructor(client: ValClient) {
		super(client, {
			name: "toxicity",
		});

		this.labels = [
			"identity_attack",
			"severe_toxicity",
			"threat",
			"insult",
			"obscene",
			"sexual_explicit",
			"toxicity",
		];
	}

	init = async () => {
		if (process.env.MODE !== "DEVELOPMENT")
			load(this.threshold, this.labels).then(model => {
				this.classifier = model;
				this.ready = true;

				log(this.client, "ToxicityController loaded successfully", "info");
			});
	};

	classify = async (message: Message) => {
		if (!this.ready) return false;

		const { content: sentence } = message;
		const predictions = await this.classifier.classify([sentence]);

		return predictions.reduce(
			(result, curr) =>
				curr.results[0].match === true &&
				curr.results[0].probabilities[1] > this.confidence
					? true
					: result,
			false,
		);
	};

	handleToxic = async (message: Message): Promise<void> => {
		const { author, channel } = message;
		const reason = "Used toxic language";

		if (isWarned(this.client, author.id)) {
			await message.reply("دي تاني مرة تقل ادبك. ادي اخرتها. mute.");
			await mute(this.client, {
				member: author.id,
				moderator: this.client.user.id,
				channel: channel.id,
				reason,
			});

			message.delete({ reason });
		} else {
			await message.reply("متبقوش توكسيك. ده تحذير, المره الجاية mute.");
			await warn(this.client, {
				member: author.id,
				moderator: this.client.user.id,
				channel: channel.id,
				reason,
			});

			message.delete({ reason });
		}
	};
}
