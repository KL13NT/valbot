import ValClient from '../ValClient';
import { ListenerHandler } from '../types/interfaces';
export default class Listener {
    client: ValClient;
    events: Map<string, ListenerHandler>;
    constructor(client: ValClient);
    init: () => void;
}
