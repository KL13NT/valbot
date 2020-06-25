import ValClient from '../ValClient';
import { Message, User, GuildMember, TextChannel, Guild, DMChannel } from 'discord.js';
export default class CommandContext {
    client: ValClient;
    message: Message;
    author: User;
    member: GuildMember;
    channel: TextChannel | DMChannel;
    guild: Guild;
    params: string[];
    constructor(client: ValClient, message: Message);
}
