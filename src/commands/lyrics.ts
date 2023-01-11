import ValClient from "../ValClient";
import lyricsFinder from "lyrics-finder";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { MusicController } from "../controllers";
import { PaginatedEmbed } from "../structures";
import { createEmbed } from "../utils/embed";
import { reply } from "../utils/general";
import { MessageEmbed, TextChannel } from "discord.js";
import { getVoiceConnections } from "@discordjs/voice";

const MAX_EMBED_LENGTH = 4096;
const LYRICS_EMBED_TIME = 4 * 60 * 1000; // 4 minutes

export default class Lyrics extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "lyrics",
			category: "Music",
			cooldown: 10 * 1000,
			options: [],
			description: "Show song lyrics",
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, interaction }: InteractionContext) => {
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		const connections = getVoiceConnections();

		if (connections.size === 0) {
			await reply("Bot.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (controller.playState === "paused") {
			await reply("Command.Lyrics.Paused", textChannel, null, interaction);
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Music.NotPlaying", textChannel, null, interaction);
			return;
		}

		const artist = song.artist || "";
		const name = song.name || song.title.replace(/ *\([^)]*\) */g, "");

		const lyrics = await lyricsFinder(artist, name);
		if (!lyrics) {
			await reply("Command.Lyrics.NotFound", textChannel, null, interaction);
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

		const paginatedEmbed = new PaginatedEmbed(
			interaction,
			textChannel,
			member,
			pages,
			LYRICS_EMBED_TIME,
		);

		await paginatedEmbed.init();
	};
}
