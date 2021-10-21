import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { capitalise, log, reply } from "../utils/general";
import { MusicController } from "../controllers";
import UserError from "../structures/UserError";
import { Snowflake, TextChannel } from "discord.js";

type Operation =
	| "delete"
	| "create"
	| "update"
	| "load"
	| "append"
	| "list"
	| "lists";

export default class PlaylistCommand extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "playlist",
			aliases: ["pl"],
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 2,
			description:
				"Create, update, delete, or load a playlist using the current queue. Playlist names cannot contain spaces. Use - instead.",
			exampleUsage: "<create|update|delete|load|list|lists> <?playlist-name>",
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, params, message, channel }: CommandContext) => {
		try {
			const operation = params[0] as Operation;
			const name = params[1] || member.user.id;
			const voiceChannel = member.voice.channel;
			const textChannel = message.channel as TextChannel;
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			if (
				/^(create)|(update)|(delete)|(append)|(load)$/i.test(operation) &&
				params.length < 1
			) {
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

				case "list": {
					const playlists = await controller.getUserPlaylists(member.id);

					if (playlists.length === 0)
						throw new UserError("This user has no playlists");

					const songs = playlists
						.map((playlist, index) => {
							const playlistName =
								playlist.name === member.user.id
									? member.user.username
									: playlist.name;
							return `**${index + 1})** ${playlistName} has ${
								playlist.queue.length
							} tracks`;
						})
						.join("\n");

					await reply("Command.Playlist.List", channel, {
						user: member.user.username,
						songs,
					});

					return;
				}

				case "lists": {
					const playlists = await controller.getAllPlaylists();
					if (playlists.length === 0)
						throw new UserError("There is not playlists");

					const map = new Map<Snowflake, string[]>();

					playlists.forEach(playlist => {
						const exists = map.has(playlist.userId);

						if (!exists) map.set(playlist.userId, []);

						map.get(playlist.userId).push(playlist.name);
					});

					let message = "";

					for (const userId of map.keys()) {
						const userPlaylists = map
							.get(userId)
							.filter(playlist => playlist !== userId);

						if (userPlaylists.length === 0) break;

						message += `<@${userId}>'s playlists:\n`;
						message += `${userPlaylists.join("\n")}\n\n`;
					}

					await reply("Command.Playlist.Lists", textChannel, {
						songs: message,
					});

					return;
				}

				case "load": {
					if (!voiceChannel) {
						await reply("User.VoiceNotConnected", message.channel);
						return;
					}

					if (!controller.canUserPlay(voiceChannel)) {
						await reply("Command.Play.NotAllowed", message.channel);
						return;
					}

					await controller.connect(voiceChannel, textChannel);
					await controller.loadPlaylist(name, member.id);
					await controller.play(true);
					break;
				}

				case "append": {
					if (!voiceChannel) {
						await reply("User.VoiceNotConnected", message.channel);
						return;
					}

					if (!controller.canUserPlay(voiceChannel)) {
						await reply("Command.Play.NotAllowed", message.channel);
						return;
					}
					await controller.connect(voiceChannel, textChannel);
					await controller.appendPlaylist(name, member.id);
					await controller.play(false);

					break;
				}

				default: {
					await reply("Command.Playlist.Invalid", message.channel);
					return;
				}
			}

			await reply(`Command.Playlist.${capitalise(operation)}`, channel);
		} catch (error) {
			if (error instanceof UserError) await reply(error.message, channel);
			else await log(this.client, error, "error");
		}
	};
}
