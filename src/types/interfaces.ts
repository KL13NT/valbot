import { ActivityType } from 'discord.js';
import {
	MongoController,
	RedisController,
	ConversationController,
	LevelsController,
	IntervalsController,
	QueueController,
	ToxicityController
} from '../Controllers';

interface AuthClientConfig {
	AUTH_ADMIN: string;
	AUTH_MOD: string;
	AUTH_VERIFIED: string;
	AUTH_EVERYONE: string;
}

interface ChannelsClientConfig {
	CHANNEL_NOTIFICATIONS: string;
	CHANNEL_RULES: string;
	CHANNEL_POLLS: string;
	CHANNEL_TEST: string;
	CHANNEL_BOT_STATUS: string;
	CHANNEL_MOD_LOGS: string;
}

interface RolesClientConfig {
	ROLE_MUTED: string;
	ROLE_WARNED: string;
}

export interface ClientConfig {
	AUTH: AuthClientConfig;
	CHANNELS: ChannelsClientConfig;
	ROLES: RolesClientConfig;
}

export type Presence = {
	message: string;
	type: ActivityType;
};

export type ClientControllers = {
	queue: QueueController;
	redis: RedisController;
	mongo: MongoController;
	levels: LevelsController;
	conversation: ConversationController;
	intervals: IntervalsController;
	toxicity: ToxicityController;
};
