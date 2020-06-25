import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { Snowflake, Message } from 'discord.js';
import { Milestone } from '../types/interfaces';
export default class LevelsController extends Controller {
    ready: boolean;
    activeVoice: Snowflake[];
    milestones: Map<number, Milestone[]>;
    constructor(client: ValClient);
    init: () => void;
    message: (message: Message) => Promise<void>;
    voiceIncrement: () => Promise<void>;
    initUser: (id: string) => Promise<void>;
    trackUser(id: Snowflake): void;
    untrackUser(id: Snowflake): void;
    levelUp: (messageOrId: string | Message) => Promise<void>;
    enforceMilestone(userLevel: number, id: Snowflake): Promise<void>;
    levelUpMessage(id: Snowflake, level: number): Promise<void>;
    addMilestone(level: number, name: string, description: string, roleID: Snowflake): void;
    getMilestone(level: number): Milestone[];
    removeMilestone(level: number, name: string): Promise<void>;
}
