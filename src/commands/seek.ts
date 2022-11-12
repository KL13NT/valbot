import ValClient from "../ValClient";
import { MusicController } from "../controllers";
import { reply, formatDuration } from "../utils/general";
import { TextChannel } from "discord.js";
import InteractionContext from "../structures/InteractionContext";
import Interaction from "../structures/Interaction";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { getVoiceConnection } from "@discordjs/voice";

export default class Seek extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "seek",
			category: "Music",
			cooldown: 5 * 1000,
			options: [
				{
					name: "position",
					description: "Specific time such as 02:20 or seconds",
					required: true,
					type: ApplicationCommandOptionType.String,
				},
			],
			description: "Seek to position in seconds.",
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		channel,
		interaction,
		params,
		guild,
	}: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const connection = getVoiceConnection(guild.id);

		if (!connection) {
			await reply("Bot.VoiceNotConnected", channel, null, interaction);
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		if (controller.playState !== "playing") {
			await reply("Music.NotPlaying", textChannel, null, interaction);
			return;
		}

		const { duration, title, url } = controller.getCurrentSong();
		const timestamp = this.stringToTimestamp(params.getString("position"));

		if (this.isInvalidTimestamp(timestamp)) {
			await reply("Command.Seek.Invalid", textChannel, null, interaction);
			return;
		}

		// Song duration is represented in milliseconds.
		if (timestamp > duration / 1000) {
			await reply("Command.Seek.TimeExceeded", textChannel, null, interaction);
			return;
		}

		await reply(
			"Command.Seek.Seeked",
			textChannel,
			{
				title,
				url,
				timestamp: formatDuration(timestamp * 1000),
			},
			interaction,
		);

		controller.seek(timestamp);
	};

	stringToTimestamp = (time: string) => {
		return time
			.split(":")
			.map(period => Number(period))
			.reduce((accumulator, period) => 60 * accumulator + period, 0);
	};

	isInvalidTimestamp = (timestamp: number) => {
		return isNaN(timestamp) || timestamp < 0;
	};
}
