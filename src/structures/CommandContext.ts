import ValClient from "../ValClient";
import {
	Message,
	User,
	GuildMember,
	TextChannel,
	Guild,
	DMChannel,
	NewsChannel,
} from "discord.js";

export default class CommandContext {
	client: ValClient;
	message: Message;
	author: User;
	member: GuildMember;
	channel: TextChannel | DMChannel | NewsChannel;
	guild: Guild;
	params: string[];

	constructor(client: ValClient, message: Message) {
		this.client = client;
		this.message = message;
		this.author = message.author;
		this.member = message.member;
		this.channel = message.channel as TextChannel;
		this.guild = message.guild;
		this.params = message.content
			.replace(/\s+/gi, " ")
			.replace(client.prefix, "")
			.split(" ")
			.slice(1);
		this.message.content = this.message.content.replace(/\s+/g, " ");
	}
}
