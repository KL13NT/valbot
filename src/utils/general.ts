/* eslint-disable prefer-rest-params */
import { NotificationOptions, ReminderSubscription } from "../types/interfaces";

import { getChannelObject } from "./object";
import {
	TextChannel,
	GuildMember,
	Message,
	Permissions,
	CommandInteraction,
	TextBasedChannel,
	Util,
} from "discord.js";
import { ParsedResult } from "chrono-node";
import prettyMilliseconds from "pretty-ms";
import messages from "../messages.json";
import { createEmbed } from "./embed";
import { APIMessage } from "discord-api-types/v10";

/**
 * Sends notification to specified channel or to notifications channel
 */
export async function notify(options: NotificationOptions) {
	const { client, notification, embed, channel } = options;
	const { CHANNEL_NOTIFICATIONS } = client.config;

	const target = getChannelObject(client, channel || CHANNEL_NOTIFICATIONS);

	if (!target) throw Error("Channel unavailable");

	await target.send({ content: notification, embeds: [embed] });
}

/**
 * Calculates the number of unique words in a sentence
 */
export function calculateUniqueWords(message: string) {
	const unique: { [index: string]: number } = {};

	return message.split(" ").filter(word => {
		if (unique[word] > 3) return false;

		if (unique[word] === undefined) {
			unique[word] = 0;
			return true;
		}

		unique[word] += 1;
		return false;
	}).length;
}

export function calculateNextLevel(exp: number) {
	const level = Math.floor((exp - 60) / 6);
	return level <= 0 ? 1 : level;
}

export function levelToExp(level: number) {
	return level * 6 + 60;
}

export function capitalise(str: string) {
	return str.replace(
		/\w\S*/g,
		txt => txt.charAt(0).toUpperCase() + txt.substr(1),
	);
}

// Transforms an object to include only keys available in another object. Flat objects only.
export function transformObject<T>(
	first: Record<string, unknown>,
	second: Record<string, unknown>,
): T {
	const x1 = { ...first };
	const x2 = { ...second };

	Object.keys(x2).forEach(key => {
		if (!x1[key]) {
			x1[key] = x2[key];
		}
	});

	Object.keys(x1).forEach(key => {
		if (typeof x2[key] === "undefined") {
			delete x1[key];
		}
	});

	return <T>(<Record<string, unknown>>x1);
}

export async function awaitMessages(channel: TextChannel, member: GuildMember) {
	const filter = ({ author }: Message) => author.id === member.id;

	return (
		await channel.awaitMessages({
			filter,
			max: 1,
			time: 60 * 1000,
			errors: ["time"],
		})
	).first().content;
}

export function reminderSubsToString(subs: ReminderSubscription[]) {
	return subs
		.map(sub => `<@${sub.member}>: ${sub.description}`)
		.reduce((final, curr) => `${final}\n${curr}`, "");
}

/**
 * Compiles a handlebars template (dumb)
 * Uses new RegExp to create keys, make sure to handle that in your code.
 */
export function compileTemplate(
	data: Record<string, unknown>,
	template: string,
) {
	let temp = template;

	Object.keys(data).forEach(key => {
		temp = temp.replace(new RegExp(`${key}`, "g"), <string>data[key]);
	});

	return temp;
}

export const isAdmin = (member: GuildMember) =>
	member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);

export const isDev = () => process.env.MODE === "DEVELOPMENT";

export const chronoResultToObject = (result: ParsedResult) => ({
	year: result.start.get("year"),
	month: result.start.get("month"),
	day: result.start.get("day"),
	hour: result.start.get("hour"),
	minute: result.start.get("minute"),
	second: result.start.get("second"),
});

export const reply = async (
	id: string,
	channel: TextBasedChannel,
	data?: Record<string, unknown>,
	interaction?: CommandInteraction,
): Promise<void | APIMessage | Message<boolean>> => {
	const embed = createEmbed({
		description: compileTemplate(data || {}, messages[id] || id),
	});

	if (interaction && interaction.deferred) {
		await interaction.editReply({ embeds: [embed] });
	} else if (interaction) {
		await interaction.reply({ embeds: [embed] });
	} else {
		await channel.send({ embeds: [embed] });
	}
};

/** Format MS Duration in a specific format. */
export const formatDuration = (duration: number) =>
	prettyMilliseconds(duration, {
		colonNotation: true,
		secondsDecimalDigits: 0,
	});

/**
 * Parses a time string HH:MM:SS into milliseconds
 */
export const stringToTimestamp = (time: string) => {
	if (!time) return undefined;

	return time
		.split(":")
		.map(period => Number(period))
		.reduce((accumulator, period) => 60 * accumulator + period, 0);
};

interface SplitMessageOptions {
	maxLength: number;
	prepend?: string;
	append?: string;
}

export const splitMessage = (text: string, options: SplitMessageOptions) => {
	const { maxLength, prepend = "", append = "" } = options;

	text = Util.verifyString(text);
	if (text.length <= maxLength) return [text];

	const splitText = text.split("\n");
	const messages: string[] = [];
	let message = prepend;

	for (const chunk of splitText) {
		if ((message + chunk + append).length > maxLength) {
			messages.push(message + append);
			message = prepend;
		}

		message += (message !== prepend ? "\n" : "") + chunk;
	}

	return messages.concat(message).filter(item => item);
};
