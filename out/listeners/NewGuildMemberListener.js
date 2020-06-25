"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../structures/Listener"));
const { log } = require('../utils/general');
class NewGuildMemberListener extends Listener_1.default {
    constructor(client) {
        super(client);
        this.onGuildMemberAdd = async (member) => {
            try {
                const dm = await member.createDM();
                dm.send(`
			اهلاً بيكوا في فالاريوم! سعداء بيكم معانا جداً! :sparkler: :partying_face:
			حابين انكوا تقروا القواعد الاول في تشانل #rules.
			لو في صعوبات في التعامل مع ديسكورد او السيرفر تحديداً تقدروا تتفرجوا على الفيديو ده او تسألوا ف السيرفر: https://youtu.be/J56Ww0_GiTc
			لو حابين تتعرفوا على الـ bot تقدروا تكتبوا \`${this.client.prefix} help\` في اي تشانل ف السيرفر
			اهلاً بيكم مره تانية, و لو في اي حاجة نقدر نساعدكوا فيها متترددوش! اعتبرونا بيتكم التاني :star_struck:
			`);
            }
            catch (err) {
                log(this.client, 'Something went wrong while greeting the new member, could yall do it for me?', 'error');
            }
        };
        this.events.set('guildMemberAdd', this.onGuildMemberAdd);
    }
}
exports.default = NewGuildMemberListener;
