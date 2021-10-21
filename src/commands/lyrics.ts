import ValClient from "../ValClient";
import lyricsFinder from "lyrics-finder";
import { MusicController } from "../controllers";
import { Command, CommandContext, PaginatedEmbed } from "../structures";
import { createEmbed } from "../utils/embed";
import { log, reply } from "../utils/general";
import { MessageEmbed, TextChannel } from "discord.js";

const MAX_EMBED_LENGTH = 4096;

export default class Lyrics extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "lyrics",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "Show song lyrics",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, channel }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			const voiceChannel = member.voice.channel;

			if (!voiceChannel) {
				await reply("User.VoiceNotConnected", channel);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await reply("User.SameChannel", channel);
				return;
			}

			if (this.client.voice.connections.size === 0) {
				await reply("Bot.VoiceNotConnected", channel);
				return;
			}

			if (controller.playState === "paused") {
				await reply("Command.Lyrics.Paused", channel);
				return;
			}

			const song = controller.getCurrentSong();

			if (!song) {
				await reply("Music.NotPlaying", channel);
				return;
			}

			const artist = song.artist || "";
			const name = song.name || song.title.replace(/ *\([^)]*\) */g, "");

			const lyrics = await lyricsFinder(artist, name);
			if (!lyrics) {
				await reply("Command.Lyrics.NotFound", channel);
				return;
			}

			const pages: MessageEmbed[] = [];
			let current = "";

			lyrics.split(/\n/).forEach(line => {
				const result = `${current}\n${line}`;

				if (result.length <= MAX_EMBED_LENGTH) {
					current = result;
					return;
				}

				pages.push(
					createEmbed({
						title: name,
						description: current,
					}),
				);

				current = "";
			});

			if (current.length > 0)
				pages.push(
					createEmbed({
						title: name,
						description: current,
					}),
				);

			const embed = new PaginatedEmbed(channel as TextChannel, member, pages);
			await embed.init();
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
