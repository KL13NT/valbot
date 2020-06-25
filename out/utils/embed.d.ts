import { ModerationEmbedOptions, RoleEmbedOptions, LevelupEmbedOptions, ClearEmbedOptions } from '../types/interfaces';
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
export declare function createUserModerationEmbed({ title, member, moderator, channel, reason, date }: ModerationEmbedOptions): MessageEmbed;
export declare function createRoleEmbed({ title, member, moderator, channel, role, date }: RoleEmbedOptions): MessageEmbed;
export declare function createLevelupEmbed({ milestone, role }: LevelupEmbedOptions): MessageEmbed;
export declare function createClearEmbed({ moderator, channel, count, date }: ClearEmbedOptions): MessageEmbed;
export declare function createEmbed(embedOptions: MessageEmbedOptions): MessageEmbed;
