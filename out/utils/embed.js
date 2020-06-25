"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function createUserModerationEmbed({ title, member, moderator, channel, reason, date }) {
    return createEmbed({
        title: title,
        fields: [
            {
                name: '**User**',
                value: `<@${member}>`,
                inline: true
            },
            { name: '**User ID**', value: member, inline: true },
            { name: '**Moderator**', value: `<@${moderator}>`, inline: false },
            { name: '**Location**', value: `<#${channel}>`, inline: true },
            { name: '**Reason**', value: reason, inline: false },
            {
                name: '**Date / Time**',
                value: date ? date.toUTCString() : new Date().toUTCString(),
                inline: true
            }
        ]
    });
}
exports.createUserModerationEmbed = createUserModerationEmbed;
function createRoleEmbed({ title, member, moderator, channel, role, date }) {
    return createEmbed({
        title: title,
        fields: [
            {
                name: '**User**',
                value: `<@${member}>`,
                inline: true
            },
            { name: '**User ID**', value: member, inline: true },
            { name: '**Moderator**', value: `<@${moderator}>`, inline: false },
            { name: '**Location**', value: `<#${channel}>`, inline: true },
            { name: '**Role**', value: `<@&${role}>`, inline: false },
            {
                name: '**Date / Time**',
                value: date ? date.toUTCString() : new Date().toUTCString(),
                inline: true
            }
        ]
    });
}
exports.createRoleEmbed = createRoleEmbed;
function createLevelupEmbed({ milestone, role }) {
    return createEmbed({
        title: `Achievement Unlocked - ${milestone.name}`,
        description: `GG! You unlocked the ${milestone.name} achievement\nYou just received the ${role.name} role!`,
        fields: [
            { name: 'Achievement name', value: milestone.name, inline: false },
            {
                name: 'Achievement description',
                value: milestone.description,
                inline: false
            }
        ]
    }).setFooter('To get all available levels ask an admin/moderator.');
}
exports.createLevelupEmbed = createLevelupEmbed;
function createClearEmbed({ moderator, channel, count, date }) {
    return createEmbed({
        title: 'Message Purge',
        fields: [
            { name: '**Moderator**', value: `<@${moderator}>`, inline: false },
            { name: '**Location**', value: `<#${channel}>`, inline: true },
            {
                name: '**Purged Amount**',
                value: `Purged **${count}** messages`,
                inline: true
            },
            {
                name: '**Date / Time**',
                value: date ? date.toUTCString() : new Date().toUTCString(),
                inline: true
            }
        ]
    });
}
exports.createClearEmbed = createClearEmbed;
function createEmbed(embedOptions) {
    const embed = new discord_js_1.MessageEmbed(embedOptions)
        .setColor('#ffcc5c')
        .setTimestamp();
    return embed;
}
exports.createEmbed = createEmbed;
