import ValClient from '../ValClient';
import Listener from '../structures/Listener';
export default class ClientReadyListener extends Listener {
    constructor(client: ValClient);
    onReady: () => void;
}
