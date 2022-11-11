declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLIENT_ID: string;
			DEV_CLIENT_ID: string;
			CLIENT_SECRET: string;
			AUTH_TOKEN: string;
			PERMISSIONS_INTEGER: string;
			DB_HOST: string;
			DB_NAME: string;
			GUILD_ID: string;
			ROLE_DEVELOPER: string;
			MODE: "DEVELOPMENT" | "PRODUCTION";
			YOUTUBE_KEY: string;
			REDIS_URL: string;
			SPOTIFY_ID: string;
			SPOTIFY_SECRET: string;
			COOKIE: string;
			SENTRY_DSN: string;
			DISCORD_HOOK_URL: string;
		}
	}
}

export {};
