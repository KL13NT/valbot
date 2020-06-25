import { ActivityType, Snowflake } from 'discord.js';
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

export type ListenerHandler = (...args: any[]) => void;

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

export type IController =
	| ConversationController
	| QueueController
	| MongoController
	| LevelsController
	| IntervalsController
	| RedisController
	| ToxicityController;

export interface QueueCall {
	func: Function;
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
	callback: Function;
}
