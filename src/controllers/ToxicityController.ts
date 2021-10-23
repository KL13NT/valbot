import {
	EmbedField,
	Message,
	MessageReaction,
	Permissions,
	Snowflake,
	TextChannel,
	User,
} from "discord.js";
import { ToxicityClassifier, load } from "@tensorflow-models/toxicity";

import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import logger from "../utils/logging";
import { isDev } from "../utils/general";
import {
	createEmbed,
	createUserModerationEmbed,
	getEmbedField,
	updateEmbedFields,
} from "../utils/embed";
import { getChannelObject, getMemberObject } from "../utils/object";
import { mute } from "../utils/moderation";
import { RedisController } from ".";

const REACT_APPROVE_MUTE = "✅";

interface ToxicityReaction {
	message: Message;
	user: User;
	reportId: Snowflake;
}

export default class ToxicityController extends Controller {
	classifier: ToxicityClassifier;
	reactQueue: ToxicityReaction[];
	labels: Record<string, string>;
	ready = false;
	threshold = 0.7;

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

			logger.info("ToxicityController loaded successfully");
		});
	};

	classify = async (message: Message): Promise<string[]> => {
		if (!this.ready || isDev()) return [];

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
		const fields: EmbedField[] = [
			{
				name: "Message Content",
				value: content,
				inline: false,
			},
			{
				name: "Message ID",
				value: id,
				inline: false,
			},
			{
				name: "Author",
				value: `<@${author.id}>`,
				inline: false,
			},
			{
				name: "Author ID",
				value: `${author.id}`,
				inline: false,
			},
			{
				name: "Violations",
				value: predictions
					.map(prediction => this.labels[prediction])
					.join("\n"),
				inline: false,
			},
			{
				name: "Involved Members",
				value:
					message.mentions.members
						.map(member => member.toString())
						.join("\n") || "None",
				inline: false,
			},
			{
				name: "Channel",
				value: `<#${channel.id}>`,
				inline: false,
			},
			{
				name: "Message Link",
				value: url,
				inline: false,
			},
			{
				name: "EMBED_TYPE",
				value: "VIOLATION_REPORT",
				inline: true,
			},
			{
				name: "STATUS",
				value: "PENDING",
				inline: true,
			},
		];

		const report = createEmbed({
			title: `Spectre Report - Rule Violation`,
			description: `Possible violations by ${author.tag}`,
			url,
			fields,
			footer: {
				text: `React with ${REACT_APPROVE_MUTE} to approve this report. The report will be ignored in 24 hours. `,
			},
		});

		const redis = <RedisController>this.client.controllers.get("redis");
		const sent = await modLogsChannel.send(report);

		await Promise.all([
			redis.setAsync(`PENDING_REPORT:SPECTRE:${sent.id}`, "0"), // 0 has smaller memory footprint than empty string or other status strings
			sent.react(REACT_APPROVE_MUTE),
		]);

		await redis.expire(
			`PENDING_REPORT:SPECTRE:${sent.id}`,
			24 * 60 * 60 /* 24 hours */,
		);
	};

	react = async (reaction: MessageReaction, user: User) => {
		await reaction.message.fetch();

		const modLogsChannel = getChannelObject(
			this.client,
			this.client.config.CHANNEL_MOD_LOGS,
		);

		const isBot = user.id === this.client.user.id;
		const isApproveEmoji = reaction.emoji.name === REACT_APPROVE_MUTE;
		const hasEmbeds = reaction.message.embeds.length > 0;
		const isModChannel = reaction.message.channel.id === modLogsChannel.id;

		if (isBot || !isApproveEmoji || !isModChannel || !hasEmbeds) return;

		const actor = await this.client.ValGuild.members.fetch(user.id);

		const isAdmin = actor.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const isMod = actor.permissions.has(Permissions.FLAGS.MANAGE_ROLES);
		const canUserMute = isAdmin || isMod;

		if (!canUserMute) return;

		const embed = reaction.message.embeds[0];
		const isViolationReportEmbed = getEmbedField(
			embed,
			"EMBED_TYPE",
			"VIOLATION_REPORT",
		);

		if (!isViolationReportEmbed) return;

		const redis = <RedisController>this.client.controllers.get("redis");

		const reportStatus = await redis.getAsync(
			`PENDING_REPORT:SPECTRE:${reaction.message.id}`,
		);

		if (typeof reportStatus !== "string") return;

		const url = `https://discord.com/channels/${this.client.ValGuild.id}/${reaction.message.channel.id}/${reaction.message.id}`;

		const reason = `Spectre Report Approved by ${user.tag}. You can view the report here: ${url}`;
		const member = getMemberObject(
			this.client,
			getEmbedField(embed, "author id").value,
		);

		const violationChannelId = getEmbedField(embed, "channel").value.match(
			/<#(\d+)>/,
		)[1];

		const muteEmbed = createUserModerationEmbed({
			title: "Muted Member",
			member: member.id,
			moderator: user.id,
			channel: violationChannelId,
			reason,
		});

		const violationMessage = getEmbedField(embed, "message id").value;
		const violationChannel = <TextChannel>(
			await this.client.channels.fetch(violationChannelId)
		);

		const updatedReport = updateEmbedFields(embed, {
			STATUS: {
				name: "STATUS",
				value: "FULFILLED",
				inline: true,
			},
		});

		await Promise.all([
			mute(this.client, {
				member: member.id,
				moderator: user.id,
				channel: reaction.message.channel.id,
				reason,
			}),
			redis.del(`PENDING_REPORT:SPECTRE:${reaction.message.id}`),
			violationChannel.messages.delete(violationMessage, reason),
			modLogsChannel.send(`${member.toString()}`, muteEmbed),
			reaction.message.edit(updatedReport),
		]);
	};
}
