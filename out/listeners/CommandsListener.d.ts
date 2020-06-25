import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { Message } from 'discord.js';
export default class CommandsListener extends Listener {
    constructor(client: ValClient);
    onCommand: (message: Message) => void;
}
