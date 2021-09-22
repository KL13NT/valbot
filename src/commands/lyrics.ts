import lyricsFinder from "lyrics-finder";
import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { createEmbed } from "../utils/embed";
import { log } from "../utils/general";
import ValClient from "../ValClient";

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

	_run = async ({ member, message }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			const voiceChannel = member.voice.channel;

			if (!voiceChannel) {
				await message.reply(
					createEmbed({
						description: `You're not connected to a voice channel`,
					}),
				);
				return;
			}

			if (!controller.canUserPlay(voiceChannel)) {
				await message.reply(
					createEmbed({
						description: "You must be in the same channel as the bot",
					}),
				);
				return;
			}

			if (this.client.voice.connections.size === 0) {
				await message.reply(
					createEmbed({
						description: "Bot is not in a voice channel.",
					}),
				);
			}

			if (controller.playState === "paused") {
				await message.reply(
					createEmbed({
						description: "Bot is paused ⏸️",
					}),
				);

				return;
			}

			const song = controller.getCurrentSong();

			if (!song) {
				await message.reply(
					createEmbed({
						description: "No song is playing",
					}),
				);
				return;
			}

			log(this.client, "Lyrics", "info");
			console.log(song);

			let lyrics;
			if (
				typeof song?.name === "undefined" ||
				typeof song?.artist === "undefined"
			) {
				lyrics = await lyricsFinder(
					"",
					song.title.replace(/ *\([^)]*\) */g, ""),
				);
			} else {
				lyrics = await lyricsFinder(
					song.artist,
					song.name.replace(/ *\([^)]*\) */g, ""),
				);
			}

			if (lyrics === "") {
				await message.reply(
					createEmbed({
						description: "No lyrics found (⊃◜⌓◝⊂)",
					}),
				);
				return;
			}

			await message.reply(
				createEmbed({
					title: !song?.name ? song.title : song.name,
					description: lyrics,
				}),
			);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
