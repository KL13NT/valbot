import { ButtonStyle } from "discord-api-types/v10";
import {
	CommandInteraction,
	GuildMember,
	Message,
	MessageActionRow,
	BaseMessageComponentOptions,
	MessageActionRowOptions,
	MessageComponentInteraction,
	MessageEmbed,
	TextChannel,
} from "discord.js";

type Row =
	| MessageActionRow
	| (Required<BaseMessageComponentOptions> & MessageActionRowOptions);

export default class PaginationEmbed {
	channel: TextChannel;
	member: GuildMember;
	pages: MessageEmbed[];
	interaction: CommandInteraction;
	current: Message;
	page: number;
	timeout: number;

	emojis = {
		"⏪": () => 0,
		"◀️": () => (this.page > 0 ? this.page - 1 : this.page),
		"▶️": () => (this.page < this.pages.length - 1 ? this.page + 1 : this.page),
		"⏩": () => this.pages.length - 1,
	};

	buttonDisableCondition = {
		"⏪": () => this.page === 0,
		"◀️": () => this.page === 0,
		"▶️": () => this.page === this.pages.length - 1,
		"⏩": () => this.page === this.pages.length - 1,
	};

	constructor(
		interaction: CommandInteraction,
		channel: TextChannel,
		member: GuildMember,
		pages: MessageEmbed[],
		timeout = 60 * 1000,
	) {
		this.interaction = interaction;
		this.channel = channel;
		this.member = member;
		this.pages = pages;
		this.page = 0;
		this.timeout = timeout;
	}

	init = async () => {
		const buttonRow: Row = {
			type: "ACTION_ROW",
			components: Object.keys(this.emojis).map(emoji => {
				return {
					custom_id: emoji,
					emoji: emoji,
					style: ButtonStyle.Primary,
					type: "BUTTON",
					disabled: this.buttonDisableCondition[emoji](),
				};
			}),
		};

		await this.interaction.editReply({
			embeds: [
				{
					...this.pages[this.page],
					footer: {
						text: `Page ${this.page + 1} / ${this.pages.length}`,
					},
				},
			],
			components: [buttonRow],
		});

		if (this.pages.length < 2) return;

		const filter = (interaction: MessageComponentInteraction) =>
			interaction.isButton &&
			Object.keys(this.emojis).includes(interaction.customId) &&
			interaction.user.id === this.member.id;

		const collector = this.interaction.channel.createMessageComponentCollector({
			filter,
			time: this.timeout,
			dispose: true,
		});

		collector.on("collect", this.onButtonClick);
	};

	onButtonClick = async (interaction: MessageComponentInteraction) => {
		const modifier = this.emojis[interaction.customId];
		this.page = modifier();

		const buttonRow: Row = {
			type: "ACTION_ROW",
			components: Object.keys(this.emojis).map(emoji => {
				return {
					custom_id: emoji,
					emoji: emoji,
					style: ButtonStyle.Primary,
					type: "BUTTON",
					disabled: this.buttonDisableCondition[emoji](),
				};
			}),
		};

		await interaction.update({
			embeds: [
				{
					...this.pages[this.page],
					footer: {
						text: `Page ${this.page + 1} / ${this.pages.length}`,
					},
				},
			],
			components: [buttonRow],
		});
	};
}
