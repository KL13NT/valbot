import { ActivityType, Snowflake, Role, MessageEmbed } from 'discord.js';
import CommandContext from '../structures/CommandContext';
import {
	ConversationController,
	IntervalsController,
	QueueController,
	MongoController,
	LevelsController,
	RedisController,
	ToxicityController
} from '../Controllers';
import ValClient from '../ValClient';

export type ListenerHandler = (...args: any[]) => void; // eslint-disable-line

export type Template = string;

export type IController =
	| ConversationController
	| QueueController
	| MongoController
	| LevelsController
	| IntervalsController
	| RedisController
	| ToxicityController;

export type AlertLevel = 'info' | 'warn' | 'error';

export interface AuthClientConfig {
	[index: string]: string;
	AUTH_ADMIN: string;
	AUTH_MOD: string;
	AUTH_VERIFIED: string;
	AUTH_EVERYONE: string;
}

export interface ChannelsClientConfig {
	[index: string]: string;
	CHANNEL_NOTIFICATIONS: string;
	CHANNEL_RULES: string;
	CHANNEL_POLLS: string;
	CHANNEL_TEST: string;
	CHANNEL_BOT_STATUS: string;
	CHANNEL_MOD_LOGS: string;
}

export interface RolesClientConfig {
	[index: string]: string;
	ROLE_MUTED: string;
	ROLE_WARNED: string;
}

export interface ClientConfig {
	AUTH: AuthClientConfig;
	CHANNELS: ChannelsClientConfig;
	ROLES: RolesClientConfig;
}

export interface Presence {
	message: string;
	type: ActivityType;
}

export interface ControllerOptions {
	name: string;
}

export interface CommandAuthOptions {
	method: string;
	required: string;
	devOnly?: boolean;
}

export interface CommandOptions {
	name: string;
	category: string;
	cooldown: number;
	nOfParams: number;
	description: string;
	exampleUsage: string;
	extraParams: boolean;
	optionalParams: number;
	auth: CommandAuthOptions;
}

export interface ICommand {
	_run(context: CommandContext): Promise<void> | void;
}

export interface QueueCall {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	func: (...args: any[]) => any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	args: any[];
}

export interface Level {
	exp: number;
	text: number;
	voice: number;
	level: number;
	textXP: number;
	voiceXP: number;
	id: Snowflake;
}

export interface Milestone {
	level: number;
	name: string;
	description: string;
	roleID: Snowflake;
}

export interface Response {
	invoker: string;
	reply: string;
}

export interface IntervalOptions {
	name: string;
	time: number;
	callback: () => void;
}

export interface ModerationEmbedOptions {
	title: string;
	reason: string;
	date?: Date;
	member: Snowflake;
	moderator: Snowflake;
	channel: Snowflake;
}

export interface RoleEmbedOptions {
	title: string;
	date?: Date;
	role: Snowflake;
	member: Snowflake;
	moderator: Snowflake;
	channel: Snowflake;
}

export interface ClearEmbedOptions {
	date?: Date;
	moderator: Snowflake;
	channel: Snowflake;
	count: number;
}

export interface LevelupEmbedOptions {
	milestone: Milestone;
	role: Role;
}

export interface EventVariable {
	name: string;
	value: string;
}

export interface EventOptions {
	variables: EventVariable[];
	template: Template;
}

export interface NotificationOptions {
	client: ValClient;
	notification: string;
	embed?: MessageEmbed;
	channel?: Snowflake;
}

export interface LogOptions {
	client: ValClient;
	notification: string | Error;
	alertLevel: AlertLevel;
}

export interface UserModerationOptions {
	member: Snowflake;
	moderator: Snowflake;
	channel: Snowflake;
	reason: string;
}

export interface UserInfo {
	avatar_url: string;
	displayName: string;
}

export interface SVGContentLevelInfo extends Level {
	levelEXP: number;
}

export interface SVGContentOptions {
	levelInfo: SVGContentLevelInfo;
	userInfo: UserInfo;
}

export interface SVGContent {
	CANVAS_BACKGROUND: string;
	USER_AVATAR: string;
	ICON_MIC: string;
	USER_NAME: string;
	CURRENT_LEVEL: number;
	CURRENT_EXP: number;
	LEVEL_EXP: number;
	VOICE_LEVEL: number;
	TEXT_LEVEL: number;
}
