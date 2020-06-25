import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { GuildMember } from 'discord.js';

import { log } from '../utils/general';

export default class NewGuildMemberListener extends Listener {
	constructor(client: ValClient) {
		super(client);

		this.events.set('guildMemberAdd', this.onGuildMemberAdd);
	}

	onGuildMemberAdd = async (member: GuildMember): Promise<void> => {
		try {
			const dm = await member.createDM();
			dm.send(`
			اهلاً بيكوا في فالاريوم! سعداء بيكم معانا جداً! :sparkler: :partying_face:
			حابين انكوا تقروا القواعد الاول في تشانل #rules.
			لو في صعوبات في التعامل مع ديسكورد او السيرفر تحديداً تقدروا تتفرجوا على الفيديو ده او تسألوا ف السيرفر: https://youtu.be/J56Ww0_GiTc
			لو حابين تتعرفوا على الـ bot تقدروا تكتبوا \`${this.client.prefix} help\` في اي تشانل ف السيرفر
			اهلاً بيكم مره تانية, و لو في اي حاجة نقدر نساعدكوا فيها متترددوش! اعتبرونا بيتكم التاني :star_struck:
			`);
		} catch (err) {
			log(
				this.client,
				'Something went wrong while greeting the new member, could yall do it for me?',
				'error'
			);
		}
	};
}
