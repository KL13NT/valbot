import { CommandInteraction, TextChannel, VoiceBasedChannel } from "discord.js";

import logger from "../utils/logging";
import UserError from "../structures/UserError";
import { reply } from "./general";
import {
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} from "@discordjs/voice";

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

export const handleUserError = async (
	error: unknown,
	channel: TextChannel,
	interaction?: CommandInteraction,
) => {
	try {
		if (error instanceof UserError) {
			await reply(error.message, channel, null, interaction);
			return;
		}

		logger.error(error);
	} catch (error) {
		logger.error(error);
	}
};

export const awaitJoin = async (vc: VoiceBasedChannel) => {
	const connection = joinVoiceChannel({
		channelId: vc.id,
		adapterCreator: vc.guild.voiceAdapterCreator,
		guildId: vc.guildId,
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
};
