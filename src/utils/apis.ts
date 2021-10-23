import { TextChannel } from "discord.js";

import logger from "../utils/logging";
import UserError from "../structures/UserError";
import { reply } from "./general";

export const retryRequest = async <T extends unknown>(
	func: () => Promise<T>,
	retries = 3,
): Promise<T> => {
	try {
		const res = await func();
		return res;
	} catch (error) {
		if (retries === 0) throw error;

		return retryRequest(func, retries - 1);
	}
};

export const handleUserError = async (error: unknown, channel: TextChannel) => {
	try {
		if (error instanceof UserError) {
			await reply(error.message, channel);
			return;
		}

		logger.error(error);
	} catch (error) {
		console.error(error);
	}
};
