import { Snowflake } from 'discord.js';
import ValClient from '../ValClient';
export declare function getChannelObject(client: ValClient, channelId: Snowflake): import("discord.js").GuildChannel;
export declare function getRoleObject(client: ValClient, roleID: Snowflake): import("discord.js").Role;
export declare function getMemberObject(client: ValClient, userId: Snowflake): import("discord.js").GuildMember;
