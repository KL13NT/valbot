"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandContext {
    constructor(client, message) {
        this.client = client;
        this.message = message;
        this.author = message.author;
        this.member = message.member;
        this.channel = message.channel;
        this.guild = message.guild;
        this.params = [];
        this.message.content = this.message.content.replace(/\s+/g, ' ');
    }
}
exports.default = CommandContext;
