import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { log } from "../utils/general";
import { MusicController } from "../controllers";
import { TextChannel } from "discord.js";

import ytdl from "ytdl-core";
import { createEmbed } from "../utils/embed";
import { fetchVideoMeta } from "../utils/youtube";

export default class Play extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "play",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: "احلى اغنية دي ولا ايه",
			exampleUsage: "<youtube_link>",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message, params }: CommandContext) => {
		try {
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			const textChannel = message.channel as TextChannel;
			const voiceChannel = member.voice.channel;

			if (!voiceChannel) {
				await message.reply(
					createEmbed({
						description: `You're not connected to a voice channel`,
					}),
				);
				return;
			}

			if (params.length < 1 || !ytdl.validateURL(params[0])) {
				await message.reply(
					createEmbed({
						description: `You must supply a valid YouTube video link`,
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

			const [url] = params;
			const id = ytdl.getURLVideoID(url);

			const { items } = await fetchVideoMeta(id);

			if (items.length === 0) {
				await message.reply(
					createEmbed({
						description: "Video not found",
					}),
				);
				return;
			}

			const { title } = items[0].snippet;

			controller.enqueue({
				url,
				title,
				requestingUserId: member.id,
			});

			await controller.connect(voiceChannel, textChannel);
			await controller.play();

			await message.channel.send(
				createEmbed({
					description: `Queued [${title}](${url}) [${member}]`,
				}),
			);
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
