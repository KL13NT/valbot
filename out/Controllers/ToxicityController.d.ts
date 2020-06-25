import { ToxicityClassifier } from '@tensorflow-models/toxicity';
import Controller from '../structures/Controller';
import ValClient from '../ValClient';
import { Message } from 'discord.js';
export default class ToxicityController extends Controller {
    ready: boolean;
    labels: string[];
    threshold: number;
    confidence: number;
    classifier: ToxicityClassifier;
    constructor(client: ValClient);
    classify: (message: Message) => Promise<boolean>;
    handleToxic: (message: Message) => Promise<void>;
}
