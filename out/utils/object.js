"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { MODE } = process.env;
function getChannelObject(client, channelId) {
    const { CHANNEL_TEST } = client.config.CHANNELS;
    return client.guilds.cache
        .find(guild => guild.name === 'VALARIUM')
        .channels.cache.find(ch => MODE === 'DEVELOPMENT' ? ch.id === CHANNEL_TEST : ch.id === channelId);
}
exports.getChannelObject = getChannelObject;
function getRoleObject(client, roleID) {
    return client.guilds.cache
        .find(guild => guild.name === 'VALARIUM')
        .roles.cache.find(role => {
        if (/\d+/.test(roleID))
            return role.id === roleID;
        else
            return role.name === roleID;
    });
}
exports.getRoleObject = getRoleObject;
function getMemberObject(client, userId) {
    return client.guilds.cache
        .find(guild => guild.name === 'VALARIUM')
        .members.cache.find(member => member.id === userId);
}
exports.getMemberObject = getMemberObject;
