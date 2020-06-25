import { ActivityType } from 'discord.js';

export type ListenerHandler = () => void;
export type LoaderLoad = () => Promise<void>;

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
