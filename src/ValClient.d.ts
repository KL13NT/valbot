import { Client, ClientOptions, Guild } from 'discord.js';
import { ClientConfig, ClientControllers } from './types/interfaces';
export declare class ValClient extends Client {
    readonly prefix: string;
    ready: boolean;
    commands: object;
    controllers: ClientControllers;
    config: ClientConfig;
    ValGuild: Guild;
    constructor(options: ClientOptions);
    init: (token?: string | undefined) => void;
    setPresence: () => void;
    initLoaders: () => void;
    initListeners: () => void;
    initConfig: () => Promise<any>;
}
//# sourceMappingURL=ValClient.d.ts.map