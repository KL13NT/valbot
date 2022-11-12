import { ApplicationCommandOptionType } from "discord-api-types/v10";
import {
	Snowflake,
	Role,
	MessageEmbed,
	PresenceData,
	EmbedField,
} from "discord.js";
import { ObjectId } from "mongodb";
import CommandContext from "../structures/CommandContext";
import ValClient from "../ValClient";

export type ListenerHandler = (...args: any[]) => void; // eslint-disable-line

export type Template = string;

export type AlertLevel = "info" | "warn" | "error";

export interface Destroyable {
	destroy: () => Promise<void> | void;
}

export interface Playlist {
	/** Name of the playlist as entered by the user */
	name: string;

	/** Lowercase copy of name */
	id: string;

	userId: Snowflake;
	queue: Song[];
	_id: ObjectId;
}

export interface Song {
	/** Title of the song. Resolves to "Artists - Name" for Spotify songs and
	 * "title" for YouTube tracks */
	title: string;

	/** Index of the track at the time of enqueuing for the first time */
	id: number;

	/** YouTube artist for registered tracks */
	artist?: string;

	/** YouTube song name for registered tracks */
	name?: string;

	/** Source URL of the song */
	url: string;

	/** Indicates whether it's a live video */
	live: boolean;

	/** Indicates whether a song was loaded from Spotify, used when playing */
	spotify: boolean;

	/** A string equal to the id of a spotify track id or youtube videoid, used for caching */
	key: string;

	/** Song duration in milliseconds */
	duration: number;

	/** ID of the user who requested the song */
	requestingUserId: Snowflake;
}

export interface ClientConfig {
	[index: string]: Snowflake;

	AUTH_ADMIN: Snowflake;
	AUTH_MOD: Snowflake;
	AUTH_VERIFIED: Snowflake;
	AUTH_EVERYONE: Snowflake;

	CHANNEL_NOTIFICATIONS: Snowflake;
	CHANNEL_ANNOUNCEMENTS: Snowflake;
	CHANNEL_RULES: Snowflake;
	CHANNEL_POLLS: Snowflake;
	CHANNEL_TEST: Snowflake;
	CHANNEL_BOT_STATUS: Snowflake;
	CHANNEL_MOD_LOGS: Snowflake;
	CHANNEL_BOT_BUGS: Snowflake;

	ROLE_MUTED: Snowflake;
	ROLE_WARNED: Snowflake;
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

export interface CommandParamOptionChoice {
	name: string;
	value: string;
}

export interface CommandParamOption {
	name: string;
	description: string;
	type: ApplicationCommandOptionType;
	required: boolean;
	choices?: CommandParamOptionChoice[];
}

export interface InteractionOptions {
	name: string;
	description: string;
	category: string;
	cooldown: number;
	options: CommandParamOption[];
	aliases?: string[];
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

export interface MilestoneAchievement {
	name: string;
	description: string;
	roleID: Snowflake;
}

export interface Milestone {
	level: number;
	milestones: MilestoneAchievement[];
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
	member: Snowflake;
	moderator: Snowflake;
	channel: Snowflake;
	fields?: EmbedField[];
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
	milestone: MilestoneAchievement;
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
	notification?: string;
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
	// eslint-disable-next-line camelcase
	avatarUrl: string;
	displayName: string;
}

export interface SVGContentLevelInfo {
	exp: number;
	text: number;
	voice: number;
	level: number;
	levelEXP: number;
}

export interface SVGContentOptions {
	levelInfo: SVGContentLevelInfo;
	userInfo: UserInfo;
}

export interface SVGContent {
	[index: string]: unknown;
	USER_AVATAR: string;
	USER_NAME: string;
	CURRENT_LEVEL: number;
	CURRENT_EXP: number;
	LEVEL_EXP: number;
	VOICE_LEVEL: number;
	TEXT_LEVEL: number;
}

export interface ReminderSubscription {
	member: Snowflake;
	description: string;
}

export interface Reminder {
	time: number; // 64-bit signed integer representing epoch, truncated to the nearest minute
	subs: ReminderSubscription[];
}

export interface Presence extends PresenceData {
	priority: boolean;
	source?: string;
}
