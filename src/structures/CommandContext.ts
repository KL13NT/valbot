import ValClient from '../ValClient';
import {
	Message,
	User,
	GuildMember,
	TextChannel,
	Guild,
	DMChannel
} from 'discord.js';

export default class CommandContext {
	client: ValClient;
	message: Message;
	author: User;
	member: GuildMember;
	channel: TextChannel | DMChannel;
	guild: Guild;
	params: string[];

	constructor(client: ValClient, message: Message) {
		this.client = client;
		this.message = message;
		this.author = message.author;
		this.member = message.member;
		this.channel = message.channel;
		this.guild = message.guild;
		this.params = message.content.split(' ').slice(2);
		this.message.content = this.message.content.replace(/\s+/g, ' ');
	}
}
