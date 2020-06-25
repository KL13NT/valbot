"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ROLE_DEVELOPER, MODE } = process.env;
const object_1 = require("./object");
function createAlertMessage(message, alertLevel) {
    const notification = `[${alertLevel}] ${message}`;
    if (alertLevel === 'info')
        return notification;
    else
        return `${notification} <@${ROLE_DEVELOPER}>`;
}
exports.createAlertMessage = createAlertMessage;
function log(client, notification, alertLevel) {
    const queue = client.controllers.get('queue');
    console.log(`[${alertLevel}]`, notification);
    if (MODE !== 'PRODUCTION')
        return;
    if (!client.ready)
        return queue.enqueue({ func: log, args: [...arguments] });
    const { CHANNEL_BOT_STATUS } = client.config.CHANNELS;
    const channel = object_1.getChannelObject(client, CHANNEL_BOT_STATUS);
    const message = createAlertMessage(String(notification), alertLevel);
    channel.send(message);
}
exports.log = log;
function notify(options) {
    const { client, notification, embed, channel } = options;
    const queue = client.controllers.get('queue');
    if (!client.ready)
        return queue.enqueue({ func: notify, args: [...arguments] });
    const { CHANNEL_NOTIFICATIONS } = client.config.CHANNELS;
    const target = (object_1.getChannelObject(client, channel || CHANNEL_NOTIFICATIONS));
    return target.send(notification, { embed });
}
exports.notify = notify;
function calculateUniqueWords(message) {
    const unique = {};
    return message.split(' ').filter(word => {
        if (!unique[word] && word.length >= 2) {
            unique[word] = word;
            return true;
        }
        return false;
    }).length;
}
exports.calculateUniqueWords = calculateUniqueWords;
