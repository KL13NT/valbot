import {
	CollectorFilter,
	GuildMember,
	Message,
	MessageEmbed,
	MessageReaction,
	TextChannel,
} from "discord.js";

export default class PaginationEmbed {
	channel: TextChannel;
	member: GuildMember;
	pages: MessageEmbed[];
	emojis = {
		"⏪": () => 0,
		"◀️": () => (this.page > 0 ? this.page - 1 : this.page),
		"▶️": () => (this.page < this.pages.length - 1 ? this.page + 1 : this.page),
		"⏩": () => this.pages.length - 1,
	};

	current: Message;
	page: number;
	timeout: number;

	constructor(
		channel: TextChannel,
		member: GuildMember,
		pages: MessageEmbed[],
		timeout = 60 * 1000,
	) {
		this.channel = channel;
		this.member = member;
		this.pages = pages;
		this.page = 0;
		this.timeout = timeout;
	}

	init = async () => {
		this.current = await this.channel.send(
			this.pages[this.page].setFooter(
				`Page ${this.page + 1} / ${this.pages.length}`,
			),
		);

		if (this.pages.length < 2) return;

		const filter: CollectorFilter = (reaction, user) =>
			Object.keys(this.emojis).includes(reaction.emoji.name) &&
			!user.bot &&
			user.id === this.member.id;

		const collector = this.current.createReactionCollector(filter, {
			time: this.timeout,
			dispose: true,
		});

		for (const emoji of Object.keys(this.emojis))
			await this.current.react(emoji);

		collector.on("collect", this.onReaction);
		collector.on("remove", this.onReaction);
	};

	onReaction = async (reaction: MessageReaction) => {
		const modifier = this.emojis[reaction.emoji.name];
		this.page = modifier();

		await this.current.edit(
			this.pages[this.page].setFooter(
				`Page ${this.page + 1} / ${this.pages.length}`,
			),
		);
	};
}
