import Controller from '../structures/Controller';
import { QueueCall } from '../types/interfaces';
import ValClient from '../ValClient';
export default class QueueController extends Controller {
    ready: boolean;
    calls: QueueCall[];
    constructor(client: ValClient);
    enqueue: (func: Function, ...args: any[]) => void;
    executeAll: () => void;
}
