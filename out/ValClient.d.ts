import { Client, ClientOptions, Guild } from 'discord.js';
import { ClientConfig, IController } from './types/interfaces';
import Command from './structures/Command';
export default class ValClient extends Client {
    readonly prefix: string;
    ready: boolean;
    config: ClientConfig;
    commands: Map<string, Command>;
    controllers: Map<string, IController>;
    ValGuild: Guild;
    constructor(options: ClientOptions);
    init: (token?: string) => void;
    setPresence: () => void;
    initLoaders: () => void;
    initListeners: () => void;
    initConfig: () => Promise<any>;
}
