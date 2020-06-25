import ValClient from '../ValClient';
import Controller from '../structures/Controller';
import { MongoClient, Db } from 'mongodb';
import { Level, Milestone, Response } from '../types/interfaces';
export default class MongoController extends Controller {
    ready: boolean;
    mongo: MongoClient;
    db: Db;
    constructor(client: ValClient);
    init: () => Promise<void>;
    syncLevels: (id: string, levelToSync: Level) => Promise<void>;
    getLevel: (id: string) => Promise<Level>;
    getLevels: () => Promise<Level[]>;
    getMilestones: () => Promise<Milestone[]>;
    getResponses: () => Promise<Response[]>;
    saveResponse: ({ invoker, reply }: Response) => Promise<import("mongodb").UpdateWriteOpResult>;
}
