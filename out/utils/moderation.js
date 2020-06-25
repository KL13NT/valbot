"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("./general");
const object_1 = require("./object");
const embed_1 = require("./embed");
async function mute(client, options) {
    const { member, moderator, channel, reason } = options;
    const { ROLE_MUTED } = client.config.ROLES;
    const { CHANNEL_MOD_LOGS } = client.config.CHANNELS;
    const targetMember = object_1.getMemberObject(client, member);
    const embed = embed_1.createUserModerationEmbed({
        title: 'Muted Member',
        member,
        moderator,
        channel,
        reason
    });
    try {
        await targetMember.roles.add(ROLE_MUTED);
        setTimeout(() => {
            unmute(client, {
                member,
                moderator,
                channel,
                reason: 'Mute time expired'
            });
        }, 5 * 60 * 1000);
        general_1.notify({
            client,
            notification: `<@${member}>`,
            embed,
            channel: CHANNEL_MOD_LOGS
        });
    }
    catch (err) {
        general_1.log(client, err, 'error');
    }
}
exports.mute = mute;
async function ban(client, options) {
    const { member, moderator, channel, reason } = options;
    const { CHANNEL_MOD_LOGS } = client.config.CHANNELS;
    const targetMember = object_1.getMemberObject(client, member);
    const embed = embed_1.createUserModerationEmbed({
        title: 'Banned Member',
        member,
        moderator,
        channel,
        reason
    });
    try {
        await targetMember.ban({ reason });
        general_1.notify({
            client,
            notification: `<@${member}>`,
            embed,
            channel: CHANNEL_MOD_LOGS
        });
    }
    catch (err) {
        general_1.log(client, err, 'error');
    }
}
exports.ban = ban;
async function warn(client, options) {
    const { member, moderator, channel, reason } = options;
    const { CHANNEL_MOD_LOGS } = client.config.CHANNELS;
    const { ROLE_WARNED } = client.config.ROLES;
    const targetMember = object_1.getMemberObject(client, member);
    const embed = embed_1.createUserModerationEmbed({
        title: 'Warned Member',
        member,
        moderator,
        channel,
        reason
    });
    try {
        await targetMember.roles.add(ROLE_WARNED);
        general_1.notify({
            client,
            notification: `<@${member}>`,
            embed,
            channel: CHANNEL_MOD_LOGS
        });
    }
    catch (err) {
        general_1.log(client, err, 'error');
    }
}
exports.warn = warn;
async function unwarn(client, options) {
    const { member, moderator, channel, reason } = options;
    const { ROLE_WARNED } = client.config.ROLES;
    const { CHANNEL_MOD_LOGS } = client.config.CHANNELS;
    const targetMember = object_1.getMemberObject(client, member);
    const embed = embed_1.createUserModerationEmbed({
        title: 'Forgave Member',
        member,
        moderator,
        channel,
        reason
    });
    try {
        await targetMember.roles.remove(ROLE_WARNED);
        general_1.notify({
            client,
            notification: `<@${member}>`,
            embed,
            channel: CHANNEL_MOD_LOGS
        });
    }
    catch (err) {
        general_1.log(client, err, 'error');
    }
}
exports.unwarn = unwarn;
async function unmute(client, options) {
    const { member, moderator, channel, reason } = options;
    const { ROLE_MUTED } = client.config.ROLES;
    const { CHANNEL_MOD_LOGS } = client.config.CHANNELS;
    const targetMember = object_1.getMemberObject(client, member);
    const embed = embed_1.createUserModerationEmbed({
        title: 'Unmuted Member',
        member,
        moderator,
        channel,
        reason
    });
    try {
        await targetMember.roles.remove(ROLE_MUTED);
        general_1.notify({
            client,
            notification: `<@${member}>`,
            embed,
            channel: CHANNEL_MOD_LOGS
        });
    }
    catch (err) {
        general_1.log(client, err, 'error');
    }
}
exports.unmute = unmute;
function isWarned(client, member) {
    const { ROLE_WARNED } = client.config.ROLES;
    const targetMember = object_1.getMemberObject(client, member);
    return targetMember.roles.cache.some(role => role.id === ROLE_WARNED);
}
exports.isWarned = isWarned;
function isMuted(client, member) {
    const { ROLE_MUTED } = client.config.ROLES;
    const targetMember = object_1.getMemberObject(client, member);
    return targetMember.roles.cache.some(role => role.id === ROLE_MUTED);
}
exports.isMuted = isMuted;
