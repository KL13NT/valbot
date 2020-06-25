import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { GuildMember } from 'discord.js';
export default class NewGuildMemberListener extends Listener {
    constructor(client: ValClient);
    onGuildMemberAdd: (member: GuildMember) => Promise<void>;
}
