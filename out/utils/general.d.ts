import { AlertLevel, NotificationOptions, LogOptions } from '../types/interfaces';
export declare function createAlertMessage(message: string, alertLevel: AlertLevel): string;
export declare function log({ client, notification, alertLevel }: LogOptions): void;
export declare function notify(options: NotificationOptions): any;
export declare function calculateUniqueWords(message: string): number;
