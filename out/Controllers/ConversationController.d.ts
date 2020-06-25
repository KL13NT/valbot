import ValClient from '../ValClient';
import Controller from '../structures/Controller';
import { Response } from '../types/interfaces';
import { Message } from 'discord.js';
export default class ConversationController extends Controller {
    private ready;
    private responses;
    constructor(client: ValClient);
    init: () => Promise<void>;
    converse: (message: Message, isClientMentioned: boolean) => Promise<void>;
    teach(response: Response): Promise<void>;
    getAllResponses(): {
        [index: string]: Response;
    };
}
