import { Message } from "discord.js";
import { ToxicityClassifier, load } from "@tensorflow-models/toxicity";

import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import { log } from "../utils/general";
import { createEmbed } from "../utils/embed";
import { getChannelObject } from "../utils/object";

export default class ToxicityController extends Controller {
	ready = false;
	labels: Record<string, string>;
	threshold = 0.7;
	classifier: ToxicityClassifier;

	constructor(client: ValClient) {
		super(client, {
			name: "toxicity",
		});

		this.labels = {
			identity_attack: "Identity Attack",
			insult: "Insult",
			obscene: "Obscenity",
			severe_toxicity: "Severe Toxicity",
			sexual_explicit: "Sexually Explicit Content",
			threat: "Threats",
			toxicity: "Toxicity",
		};
	}

	init = async () => {
		if (process.env.MODE === "DEVELOPMENT") return;

		load(this.threshold, Object.keys(this.labels)).then(model => {
			this.classifier = model;
			this.ready = true;

			log(this.client, "ToxicityController loaded successfully", "info");
		});
	};

	classify = async (message: Message): Promise<string[]> => {
		if (!this.ready) return [];

		const { content: sentence } = message;
		const predictions = await this.classifier.classify([sentence]);

		return predictions
			.filter(prediction => prediction.results.some(result => result.match))
			.map(prediction => prediction.label);
	};

	report = async (message: Message, predictions: string[]): Promise<void> => {
		const { author, id, channel, content } = message;
		const modLogsChannel = getChannelObject(
			this.client,
			this.client.config.CHANNEL_MOD_LOGS,
		);

		const url = `https://discord.com/channels/${this.client.ValGuild.id}/${channel.id}/${id}`;
		const fields = [
			{
				name: "Message Content",
				value: content,
			},
			{
				name: "Author",
				value: `<@${author.id}>`,
			},
			{
				name: "Author Member ID",
				value: `${author.id}`,
			},
			{
				name: "Involved Members",
				value:
					message.mentions.members
						.map(member => member.toString())
						.join("\n") || "None",
			},
			{
				name: "Violations",
				value: predictions
					.map(prediction => this.labels[prediction])
					.join("\n"),
			},
			{
				name: "Message Link",
				value: url,
			},
		];

		const report = createEmbed({
			title: `Spectre Report - Rule Violation`,
			description: `Possible violations by ${author.tag}`,
			url,
			fields,
			footer: {
				text:
					"You can safely ignore this report if you think it's made in error",
			},
		});

		await modLogsChannel.send(report);
	};
}
