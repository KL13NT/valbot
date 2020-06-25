"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { ROLE_DEVELOPER } = process.env;
const CommandContext_1 = __importDefault(require("./CommandContext"));
const events_json_1 = require("../config/events.json");
const event_1 = require("../utils/event");
const object_1 = require("../utils/object");
const embed_1 = require("../utils/embed");
class Command {
    constructor(client, options) {
        this.run = (message) => {
            if (!this.client.ready && this.options.name !== 'setup') {
                message.reply(`مش جاهز لسه او البوت مش معمله setup. شغلوا \`${this.client.prefix} setup\``);
                return;
            }
            message.content = message.content.replace(/\s+/g, ' ');
            const split = message.content.split(' ');
            const params = split.slice(2);
            if (this.enforceParams(params, message) === true) {
                const context = new CommandContext_1.default(this.client, message);
                context.params = params;
                if (this.isAllowed(context))
                    this.enforceCooldown(context);
                else
                    message.reply(events_json_1.ERROR_COMMAND_NOT_ALLOWED);
            }
        };
        this.isAllowed = (context) => {
            const { member } = context;
            if (member && member.hasPermission('ADMINISTRATOR'))
                return true;
            if (this.options.auth.devOnly)
                return this.isDevCommand(context);
            else
                return this.isAllowedRoles(context);
        };
        this.isDevCommand = (context) => {
            const { member } = context;
            return member ? member.roles.cache.has(ROLE_DEVELOPER) : false;
        };
        this.isAllowedRoles = (context) => {
            const { member } = context;
            const { required } = this.options.auth;
            const AUTH_ROLES = this.client.config.AUTH;
            const allRoles = Object.values(AUTH_ROLES);
            const requiredRole = AUTH_ROLES[required];
            const indexOfRequiredRole = allRoles.indexOf(requiredRole);
            return member.roles.cache.some((role) => {
                const indexOfMemberRole = allRoles.indexOf(role.id);
                if (role.id === requiredRole ||
                    (indexOfMemberRole > -1 && indexOfMemberRole <= indexOfRequiredRole))
                    return true;
                return false;
            });
        };
        this.enforceCooldown = (context) => {
            const { cooldown } = this.options;
            if (this.ready)
                this._run(context);
            else
                context.message.reply(events_json_1.ERROR_COMMAND_NOT_READY);
            if (cooldown !== 0) {
                this.ready = false;
                this.cooldownTimer = setTimeout(() => {
                    this.ready = true;
                }, cooldown);
            }
        };
        this.enforceParams = (params, message) => {
            const { nOfParams, extraParams, optionalParams } = this.options;
            if (params[0] === 'help')
                this.help(message);
            else if (params.length < nOfParams - optionalParams ||
                (params.length > nOfParams && !extraParams))
                message.reply(event_1.createEventMessage(events_json_1.ERROR_INSUFFICIENT_PARAMS_PASSED, [
                    {
                        name: '_PREFIX',
                        value: this.client.prefix
                    },
                    {
                        name: 'COMMAND_NAME',
                        value: this.options.name
                    }
                ]));
            else
                return true;
        };
        this._run = (context) => { };
        this.stop = (context, isGraceful, error) => {
            if (!isGraceful)
                context.message.reply(error || events_json_1.ERROR_GENERIC_SOMETHING_WENT_WRONG);
            else
                context.message.reply(events_json_1.GENERIC_CONTROLLED_COMMAND_CANCEL);
            this.ready = true;
            clearTimeout(this.cooldownTimer);
        };
        this.help = (message) => {
            const { member } = message;
            const { name, nOfParams, exampleUsage, description, auth, category } = this.options;
            const { required, devOnly } = auth;
            const { AUTH } = this.client.config;
            const title = `**معلومات عن ${name}**\n`;
            const fields = [
                {
                    name: '**الاستعمال**',
                    value: `\`${this.client.prefix} ${this.options.name} ${exampleUsage}\``
                },
                {
                    name: '**الوصف/الوظيفة**',
                    value: `${description}`
                },
                {
                    name: '**عدد الباراميترز**',
                    value: `${nOfParams}`
                },
                {
                    name: '**اقل role مسموح بيه**',
                    value: object_1.getRoleObject(this.client, devOnly ? process.env.ROLE_DEVELOPER : AUTH[required]).name
                },
                {
                    name: '**الفئة**',
                    value: `${category}`
                }
            ];
            const embed = embed_1.createEmbed({ title, fields });
            member.createDM().then(dm => {
                dm.send(embed);
                message.reply('بعتلك رسالة جادة جداً').then(sent => {
                    setTimeout(() => {
                        sent.delete();
                    }, 5 * 1000);
                });
            });
        };
        this.client = client;
        this.options = options;
        this.ready = true;
    }
}
exports.default = Command;
