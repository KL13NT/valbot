import { TextChannel } from "discord.js";

import ValClient from "../ValClient";
import ResolveBehavior from "../entities/music/ResolveBehavior";

import { Command, CommandContext } from "../structures";
import { log, reply } from "../utils/general";
import { MusicController } from "../controllers";
import UserError from "../structures/UserError";

export default class Play extends Command {
	playBehavior: ResolveBehavior;

	constructor(client: ValClient) {
		super(client, {
			name: "play",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description:
				"Start or continue playing a song. Supports YouTube singles, playlists, mixes, and Spotify tracks, playlists, and albums.",
			exampleUsage: "?<youtube_link|spotify_link|query>",
			extraParams: true,
			optionalParams: 1,
			aliases: ["p"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});

		this.playBehavior = new ResolveBehavior();
	}

	_run = async ({ member, message, params, channel }: CommandContext) => {
		try {
			const voiceChannel = member.voice.channel;
			const textChannel = message.channel as TextChannel;
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			if (!voiceChannel) {
				await reply("User.VoiceNotConnected", message.channel);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("Command.Play.NotAllowed", message.channel);
				return;
			}

			if (params.length === 0) {
				await this.resume(controller, textChannel);
				return;
			}

			const resolved = await this.resolve(params);

			if (!resolved) {
				await reply("Command.Play.GenericError", message.channel);
				return;
			}

			controller.enqueue(resolved, member.id);

			if (Array.isArray(resolved))
				await reply("Command.Play.Playlist", message.channel, {
					number: resolved.length,
				});
			else {
				const { title, url } = resolved;
				await reply("Command.Play.Single", message.channel, {
					title,
					url,
					member,
				});
			}

			await controller.connect(voiceChannel, textChannel);
			await controller.play();
		} catch (error) {
			if (error instanceof UserError) await reply(error.message, channel);
			else await log(this.client, error, "error");
		}
	};

	resume = async (controller: MusicController, channel: TextChannel) => {
		const current = controller.getCurrentSong();
		const state = controller.playState;

		if (state === "paused") {
			controller.resume();
			await reply("Command.Play.Resumed", channel);
			return;
		}

		if (current) {
			await reply("Command.Play.AlreadyPlaying", channel);
			return;
		}

		await reply("Command.Play.NotPaused", channel);
	};

	/**
	 * @throws
	 */
	resolve = async (params: string[]) => {
		const query = params.join(" ");
		return this.playBehavior.fetch(query);
	};
}
