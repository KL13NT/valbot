"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Listener {
    constructor(client) {
        this.init = () => {
            this.events.forEach((handler, event) => {
                this.client.on(event, handler);
            });
        };
        this.client = client;
    }
}
exports.default = Listener;
