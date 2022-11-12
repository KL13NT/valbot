import ValClient from "../ValClient";
import {
	GuildMember,
	TextChannel,
	Guild,
	DMChannel,
	NewsChannel,
	CommandInteraction,
} from "discord.js";

export default class InteractionContext {
	client: ValClient;
	interaction: CommandInteraction;
	member: GuildMember;
	channel: TextChannel | DMChannel | NewsChannel;
	guild: Guild;
	params: CommandInteraction["options"];

	constructor(client: ValClient, interaction: CommandInteraction) {
		this.client = client;
		this.interaction = interaction;
		this.member = interaction.member as GuildMember;
		this.channel = interaction.channel as TextChannel;
		this.guild = interaction.guild;
		this.params = interaction.options;
	}
}
