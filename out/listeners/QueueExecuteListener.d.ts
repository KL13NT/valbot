import Listener from '../structures/Listener';
import ValClient from '../ValClient';
export default class QueueExecuteListener extends Listener {
    constructor(client: ValClient);
    onQueueExecute: (reason: string) => Promise<void>;
}
