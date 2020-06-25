import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { Message } from 'discord.js';
export default class MessageListener extends Listener {
    constructor(client: ValClient);
    onMessage: (message: Message) => Promise<void>;
    shouldNotHandle: ({ author, channel, type, webhookID }: Message) => boolean;
}
