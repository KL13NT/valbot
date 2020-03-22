import { GuildChannel, TextChannel, ClientOptions, Message, Client, User, GuildMember, Guild } from "discord.js";
import { MongoClient, Collection, Db } from "mongodb";


declare global{
	export function getChannelObject(client: ValClient, channel: string): GuildChannel;

	export class ValClient extends Client {
		readonly options: ClientOptions;
		public readonly prefix: string;
		public commands: object;

		public init(): void;
		private initLoaders(): void;
		private initListeners(): void;
		private setPresence(): void;
	}

	export class ToxicityLoader {
		labels: string[];
		isReady: boolean;

		classifyAndWarn(message: Message): void;
		mutedChecker(): void;

		init(): void;
		initLoaders(): void;
		initListeners(): void;
		setPresence(): void;
	}

	export class Databse extends MongoClient {
		host: string;
		name: string;
		collections: Collection[];
		isReady: boolean;

		init(): void
		getDb(): Db
		ready(): boolean
	}

	export class CommandContext{
		client: ValClient;
		message: Message;
		author: User;
		member: GuildMember;
		channel: TextChannel;
		guild: Guild
		params: string[]
		authLevel: number;

		determineAuthLevel(): number;
	}

	export class CommandOptions {
		constructor(options: object);

		cooldown: number;
		description: string;
		exampleUsage: string;
		extraParams?: boolean;
		name: string;
		nOfParams: number;
		requiredAuthLevel: number;

		verifySchema(): boolean;
	}

	export class Command {
		constructor(client: ValClient, options: CommandOptions);

		client: ValClient;
		options: CommandOptions;
		isReady: boolean;

		isAllowed(context: CommandContext)
		run(message: Message): void;
		enforceCooldown(context: CommandContext): void;
		enforceParams(params: string[], message: Message): boolean;
		_run(context: CommandContext): void;
		stop(context: CommandContext, isGraceful: boolean, error?: Error): void;
		help(message: Message): void;
	}

	export class Clear extends Command {
		constructor(client: ValClient);

	}
}