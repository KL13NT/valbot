import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { RedisClient } from 'redis';
export default class RedisController extends Controller {
    ready: boolean;
    redis: RedisClient;
    constructor(client: ValClient);
    private getAsync;
    private setAsync;
    private incrAsync;
    private incrbyAsync;
    errorListener: (err: Error) => void;
    readyListener: () => void;
    set: (key: string, value: string) => Promise<unknown>;
    get: (key: string) => Promise<string>;
    incr: (key: string) => Promise<number>;
    incrby: (key: string, by: number) => Promise<number>;
}
