const { ROLE_DEVELOPER, MODE } = process.env;

import { AlertLevel, NotificationOptions } from '../types/interfaces';
import { QueueController } from '../Controllers';
import ValClient from '../ValClient';

import { getChannelObject } from './object';
import { TextChannel } from 'discord.js';

export function createAlertMessage(message: string, alertLevel: AlertLevel) {
	const notification = `[${alertLevel}] ${message}`;

	if (alertLevel === 'info') return notification;
	else return `${notification} <@${ROLE_DEVELOPER}>`;
}

/**
 * Logs events to client and console
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#Description
 */
export function log(
	client: ValClient,
	notification: string | Error,
	alertLevel: AlertLevel
) {
	const queue = <QueueController>client.controllers.get('queue');

	console.log(`[${alertLevel}]`, notification); // need console regardless

	if (MODE !== 'PRODUCTION') return;
	if (!client.ready) return queue.enqueue(log, ...arguments);

	const { CHANNEL_BOT_STATUS } = client.config.CHANNELS;

	const channel = <TextChannel>getChannelObject(client, CHANNEL_BOT_STATUS);
	const message = createAlertMessage(String(notification), alertLevel); // @see

	channel.send(message);
}

/**
 * Sends notification to specified channel or to notifications channel
 */
export function notify(options: NotificationOptions) {
	const { client, notification, embed, channel } = options;
	const queue = <QueueController>client.controllers.get('queue');

	if (!client.ready) return queue.enqueue(notify, ...arguments);

	const { CHANNEL_NOTIFICATIONS } = client.config.CHANNELS;

	const target = <TextChannel>(
		getChannelObject(client, channel || CHANNEL_NOTIFICATIONS)
	);

	return target.send(notification, { embed });
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
