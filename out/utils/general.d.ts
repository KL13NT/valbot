/// <reference types="discord.js" />
import { AlertLevel, NotificationOptions } from '../types/interfaces';
import ValClient from '../ValClient';
export declare function createAlertMessage(message: string, alertLevel: AlertLevel): string;
export declare function log(client: ValClient, notification: string | Error, alertLevel: AlertLevel): void;
export declare function notify(options: NotificationOptions): void | Promise<import("discord.js").Message>;
export declare function calculateUniqueWords(message: string): number;
