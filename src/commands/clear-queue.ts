import { getVoiceConnections } from "@discordjs/voice";
import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class ClearQueue extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "cq",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "فضي يابني الليستة دي",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			aliases: ["stop", "clear"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", message.channel, {});
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", message.channel, {});
			return;
		}

		const connections = getVoiceConnections();

		if (connections.size === 0) {
			await reply("Bot.VoiceNotConnected", message.channel, {});
			return;
		}

		if (controller.queue.length === 0) {
			await reply("Command.ClearQueue.AlreadyEmpty", message.channel);
			return;
		}

		await reply("Command.ClearQueue.Cleared", message.channel);

		await controller.clear();
	};
}
