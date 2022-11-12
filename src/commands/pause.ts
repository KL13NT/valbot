import ValClient from "../ValClient";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { getVoiceConnection } from "@discordjs/voice";

export default class Pause extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "pause",
			category: "Music",
			cooldown: 5 * 1000,
			options: [],
			description: "وقف الاغنية دي",
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		channel,
		guild,
		interaction,
	}: InteractionContext) => {
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;
		const connection = getVoiceConnection(guild.id);

		if (!connection) {
			await reply("Bot.VoiceNotConnected", channel, {}, interaction);
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", channel, {}, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", channel, {}, interaction);
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Command.NowPlaying.NoSong", channel, {}, interaction);
			return;
		}

		if (controller.playState === "paused") {
			await reply("Command.Pause.AlreadyPaused", channel, {}, interaction);
			return;
		}

		await reply("Command.Pause.Paused", channel, {}, interaction);

		await controller.pause();
	};
}
