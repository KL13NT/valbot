import ytdl from "ytdl-core";

import {
	Snowflake,
	StreamDispatcher,
	TextChannel,
	VoiceChannel,
	VoiceConnection,
	VoiceState,
} from "discord.js";
import { Controller } from "../structures";
import ValClient from "../ValClient";
import { Readable } from "stream";
import { isChannelEmpty } from "../utils/object";
import { createEmbed } from "../utils/embed";
import { log } from "../utils/general";

export type Seconds = number;

export type PlayState = "stopped" | "paused" | "playing" | "fetching";

export interface Song {
	title: string;
	url: string;

	/** ID of the user who requested the song */
	requestingUserId: Snowflake;
}

export interface MusicControllerState {
	/** An array of the songs in the current queue */
	queue: Song[];

	/** Playing state of the bot */
	state: PlayState;

	/** Index of currently playing song */
	index: number;

	/** Position of the currently playing song in seconds */
	position: Seconds;

	/** Text channel used to report changes and replies */
	text: TextChannel;

	/** Voice channel the bot is connected to */
	vc: VoiceChannel;

	/** ytdl play stream  */
	stream: Readable;

	/** Voice connection for current instance */
	connection: VoiceConnection;

	/** Timeout number for disconnecting after period of time */
	timeout: NodeJS.Timeout;

	/** The connection.play dispatcher, used for seeking and other ops */
	dispatcher: StreamDispatcher;

	/** Playing interval for calculating current position */
	// interval: NodeJS.Timeout;
}

const DISCONNECT_AFTER = 5 * 60 * 1000; // 5 minutes
const QUALITY_ITAG = "lowestaudio";

export default class MusicController extends Controller {
	private state: MusicControllerState = {
		state: "stopped",
		index: 0,
		position: 0,
		queue: [],
		text: null,
		vc: null,
		connection: null,
		stream: null,
		timeout: null,
		dispatcher: null,
	};

	constructor(client: ValClient) {
		super(client, {
			name: "music",
		});
	}

	init = async () => {
		this.client.on("voiceStateUpdate", this.handleStateUpdate);

		this.play(true);
	};

	handleStateUpdate = async (oldState: VoiceState, newState: VoiceState) => {
		try {
			if (oldState.member.id === this.client.user.id)
				await this.handleBotStateChange(oldState, newState);
			else if (
				oldState.channel?.id === this.state.vc?.id ||
				newState.channel?.id === this.state.vc?.id
			)
				this.onStateChanged();
		} catch (error) {
			log(this.client, error, "error");
		}
	};

	handleBotStateChange = async (
		_oldState: VoiceState,
		newState: VoiceState,
	) => {
		if (!newState.channel && this.state.state === "playing") {
			await this.disconnect("User disconnected bot");
			return;
		}

		this.setState({
			vc: newState.channel,
		});
	};

	enqueue = (song: Song) => {
		this.setState({
			queue: [...this.state.queue, song],
		});
	};

	jump = async (op: "skip" | "prev" = "skip") => {
		if (op === "prev" && this.state.index === 0)
			return "No previous song in queue";

		if (op === "skip" && this.state.index === this.state.queue.length - 1)
			return "No more songs in queue";

		this.setState({
			index: this.state.index + (op === "skip" ? 1 : -1),
		});

		this.state.stream.destroy();

		if (this.state.state === "playing") this.play(true);
	};

	shouldTimeout = () => {
		return (
			isChannelEmpty(this.state.vc) ||
			this.state.queue.length === 0 /* empty queue */ ||
			this.state.state === "paused" ||
			this.state.state === "stopped" ||
			this.state.connection?.voice?.serverMute
		);
	};

	/**
	 *
	 * @param force a boolean to force a play, used when internal skipping
	 * @returns
	 */
	play = async (force = false) => {
		if (
			this.state.queue.length === 0 ||
			(this.state.state === "playing" && !force)
		) {
			return;
		}

		const song = this.state.queue[this.state.index];

		const stream = ytdl(song.url, {
			quality: QUALITY_ITAG,
		});

		this.setState({
			stream,
			state: "playing",
		});

		const dispatcher = this.state.connection.play(stream);
		dispatcher.on("finish", () => this.jump("skip"));
	};

	pause = async () => {
		this.state.stream.destroy();

		this.setState({
			state: "paused",
			stream: null,
		});
	};

	// skip = async () => {};
	// clear = async () => {};
	// list = async () => {};

	connect = async (vc: VoiceChannel, text: TextChannel) => {
		if (!this.state.vc)
			this.setState({
				vc,
				text,
				connection: this.state.connection || (await vc.join()),
			});
	};

	disconnect = async (reason = "User disconnected bot") => {
		if (this.state.connection) this.state.connection.disconnect();
		if (this.state.stream) this.state.stream.destroy();

		clearTimeout(this.state.timeout);

		const reply = await this.state.text.send(
			createEmbed({
				description: `Disconnected from voice channel. Reason: ${reason}`,
			}),
		);

		this.state = {
			stream: null,
			connection: null,
			text: null,
			vc: null,
			queue: [],
			state: "stopped",
			timeout: null,
			position: 0,
			index: 0,
			dispatcher: null,
		};

		return reply;
	};

	canUserPlay = (vc: VoiceChannel) => {
		return !this.state.vc || this.state.vc?.id === vc.id;
	};

	private setState = (state: Partial<MusicControllerState>) => {
		this.state = { ...this.state, ...state };

		this.onStateChanged();
	};

	private onStateChanged = () => {
		if (this.shouldTimeout() && !this.state.timeout) {
			this.state.timeout = setTimeout(
				() => this.disconnect("No one was listening :("),
				DISCONNECT_AFTER,
			);
		} else if (!this.shouldTimeout()) {
			clearTimeout(this.state.timeout);
			this.state.timeout = null;
		}
	};
}
