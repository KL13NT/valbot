const { ROLE_DEVELOPER, MODE } = process.env;

import { AlertLevel, NotificationOptions } from '../types/interfaces';
import { QueueController } from '../Controllers';
import ValClient from '../ValClient';

import { getChannelObject } from './object';
import { TextChannel } from 'discord.js';

export function createAlertMessage(message: string, alertLevel: AlertLevel) {
	const notification = `[${alertLevel}] ${message}`;

	if (alertLevel === 'info') return notification;
	else return `${notification} <@&${ROLE_DEVELOPER}>`;
}

/**
 * Logs events to client and console
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#Description
 */
export async function log(
	client: ValClient,
	notification: string | Error,
	alertLevel: AlertLevel
) {
	const queue = <QueueController>client.controllers.get('queue');

	console.log(`[${alertLevel}]`, notification); // need console regardless

	if (MODE !== 'PRODUCTION' || !client.ready) return;
	if (queue && queue.ready)
		return queue.enqueue({ func: log, args: [...arguments] });

	const { CHANNEL_BOT_STATUS } = client.config;

	const channel = <TextChannel>getChannelObject(client, CHANNEL_BOT_STATUS);
	const message = createAlertMessage(String(notification), alertLevel); // @see

	if (typeof notification === 'object')
		await channel.send(`${message}\n\n**Stack trace**\n${notification.stack}`);
	else await channel.send(`${message}`);
}

/**
 * Sends notification to specified channel or to notifications channel
 */
export async function notify(options: NotificationOptions) {
	const { client, notification, embed, channel } = options;
	const queue = <QueueController>client.controllers.get('queue');

	if (!client.ready)
		return queue.enqueue({ func: notify, args: [...arguments] });

	const { CHANNEL_NOTIFICATIONS } = client.config;

	const target = getChannelObject(client, channel || CHANNEL_NOTIFICATIONS);

	if (!target) throw Error('Channel unavailable');

	await target.send({ content: notification, embed });
}

/**
 * Calculates the number of unique words in a sentence
 */
export function calculateUniqueWords(message: string) {
	const unique: { [index: string]: string } = {};

	return message.split(' ').filter(word => {
		if (!unique[word] && word.length >= 2) {
			unique[word] = word;
			return true;
		}

		return false;
	}).length;
}

export function capitalise(event: string) {
	return event.charAt(0).toUpperCase() + event.substr(1);
}

// Transforms an object to include only keys available in another object. Flat objects only.
export function transformObject<T>(
	first: Record<string, unknown>,
	second: Record<string, unknown>
): T {
	const x1 = { ...first };
	const x2 = { ...second };

	Object.keys(x2).forEach(key => {
		if (!x1[key]) {
			x1[key] = x2[key];
		}
	});

	Object.keys(x1).forEach(key => {
		if (typeof x2[key] === 'undefined') {
			delete x1[key];
		}
	});

	return <T>(<Record<string, unknown>>x1);
}
