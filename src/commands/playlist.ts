import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { capitalise, log, reply } from "../utils/general";
import { MusicController } from "../controllers";
import UserError from "../structures/UserError";
import { TextChannel } from "discord.js";

type Operation = "delete" | "create" | "update" | "load";

export default class Playlist extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "playlist",
			aliases: ["pl"],
			category: "Music",
			cooldown: 1000,
			nOfParams: 2,
			description:
				"Create, update, delete, or load a playlist using the current queue. Playlist names cannot contain spaces. Use - instead.",
			exampleUsage: "<create|update|delete|load> playlist-name",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, params, message, channel }: CommandContext) => {
		try {
			const operation = params[0] as Operation;
			const [, name] = params;
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

			if (!/^(create)|(update)|(delete)|(load)$/i.test(operation)) {
				await reply("Command.Playlist.Invalid", channel);
				return;
			}

			switch (operation) {
				case "create":
					await controller.createPlaylist(name, member.id);
					break;
				case "delete":
					await controller.deletePlaylist(name, member.id);
					break;
				case "update":
					await controller.updatePlaylist(name, member.id);
					break;
				case "load": {
					await controller.connect(voiceChannel, textChannel);
					await controller.loadPlaylist(name, member.id);
					await controller.play(true);
					break;
				}
			}

			await reply(`Command.Playlist.${capitalise(operation)}`, channel);
		} catch (error) {
			if (error instanceof UserError) await reply(error.message, channel);
			else await log(this.client, error, "error");
		}
	};
}
