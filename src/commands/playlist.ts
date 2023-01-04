import ValClient from "../ValClient";

import { capitalise, reply } from "../utils/general";
import { MusicController } from "../controllers";
import UserError from "../structures/UserError";
import { Snowflake, TextChannel } from "discord.js";
import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";

enum Subcommand {
	Delete = "delete",
	Create = "create",
	Update = "update",
	Load = "load",
	Append = "append",
	List = "list",
	Lists = "lists",
}

const ModificationsOptions: APIApplicationCommandBasicOption[] = [
	{
		name: "name",
		description: "Playlist name",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
];

export default class PlaylistCommand extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "playlist",
			category: "Music",
			cooldown: 5 * 1000,
			description:
				"Create, update, delete, or load a playlist using the current queue.",
			options: [
				{
					name: Subcommand.Create,
					description: "Create playlist",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.Append,
					description: "Append playlist to current queue",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.Delete,
					description: "Delete playlist",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.List,
					description: "List playlist content",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.Load,
					description: "Load playlist instead of current queue",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.Update,
					description: "Update playlist with current queue",
					type: ApplicationCommandOptionType.Subcommand,
					options: ModificationsOptions,
				},
				{
					name: Subcommand.Lists,
					description: "List all playlists",
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		params,
		interaction,
		channel,
	}: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const subcommand = interaction.options.getSubcommand() as Subcommand;
		const name = params.getString("name");

		switch (subcommand) {
			case Subcommand.Create:
				await controller.createPlaylist(name, member.id);
				break;

			case Subcommand.Delete:
				await controller.deletePlaylist(name, member.id);
				break;

			case Subcommand.Update:
				await controller.updatePlaylist(name, member.id);
				break;

			case Subcommand.List: {
				const playlists = await controller.getUserPlaylists(member.id);

				if (playlists.length === 0)
					throw new UserError("This user has no playlists");

				await reply(
					"Command.Playlist.List",
					channel,
					{
						user: member.user.username,
						songs: playlists
							.map(
								(playlist, index) =>
									`**${index + 1})** ${playlist.name} has ${
										playlist.queue.length
									} tracks`,
							)
							.join("\n"),
					},
					interaction,
				);

				return;
			}

			case Subcommand.Lists: {
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
					message += `<@${userId}>'s playlists:\n`;
					message += `${map.get(userId).join("\n")}\n\n`;
				}

				await reply(
					"Command.Playlist.Lists",
					textChannel,
					{
						songs: message,
					},
					interaction,
				);

				return;
			}

			case Subcommand.Load: {
				if (!voiceChannel) {
					await reply("User.VoiceNotConnected", channel, null, interaction);
					return;
				}

				if (!controller.canUserPlay(voiceChannel)) {
					await reply("Command.Play.NotAllowed", channel, null, interaction);
					return;
				}

				await controller.connect(voiceChannel, textChannel);
				await controller.loadPlaylist(name, member.id);
				await controller.play(true);
				break;
			}

			case Subcommand.Append: {
				if (!voiceChannel) {
					await reply("User.VoiceNotConnected", channel, null, interaction);
					return;
				}

				if (!controller.canUserPlay(voiceChannel)) {
					await reply("Command.Play.NotAllowed", channel, null, interaction);
					return;
				}
				await controller.connect(voiceChannel, textChannel);
				await controller.appendPlaylist(name, member.id);
				await controller.play(false);

				break;
			}

			default: {
				await reply("Command.Playlist.Invalid", channel, null, interaction);
				return;
			}
		}

		await reply(
			`Command.Playlist.${capitalise(subcommand)}`,
			channel,
			{ name },
			interaction,
		);
	};
}
