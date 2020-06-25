import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { IntervalOptions } from '../types/interfaces';
export default class IntervalsController extends Controller {
    ready: boolean;
    intervals: Map<string, number>;
    constructor(client: ValClient);
    setInterval(intervalOptions: IntervalOptions): void;
    clearInterval(name: string): void;
    exists(name: string): boolean;
}
