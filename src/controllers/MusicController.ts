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
import { PresenceController } from "./index";

export type Seconds = number;
export type LoopState = "single" | "queue" | "disabled";
export type PlayState = "stopped" | "paused" | "playing" | "fetching";

export interface Song {
	title: string;

	artist?: string;
	name?: string;
	url: string;
	live: boolean;

	/** Song duration in milliseconds */
	duration: number;

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

	/** Looping mode
	 * @default 'disabled'
	 */
	loop: LoopState;

	/** Playing interval for calculating current position */
	// interval: NodeJS.Timeout;
}

const DISCONNECT_AFTER = 5 * 60 * 1000; // 5 minutes
const LOOP_STATES: LoopState[] = ["disabled", "queue", "single"];

export default class MusicController extends Controller {
	private presence: PresenceController;
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
		loop: "disabled",
	};

	constructor(client: ValClient) {
		super(client, {
			name: "music",
		});
	}

	init = async () => {
		this.presence = this.client.controllers.get(
			"presence",
		) as PresenceController;

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
		log(
			this.client,
			`Enqueued ${song.title} by ${song.requestingUserId}`,
			"info",
		);

		this.setState({
			queue: [...this.state.queue, song],
		});
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

		log(
			this.client,
			`Starting to play ${song.title} with \`lowest\` format`,
			"info",
		);

		const stream = ytdl(song.url, { quality: "lowest" });
		stream.on("error", async error => {
			log(this.client, error, "error");

			await this.state.text.send(
				createEmbed({
					description: `Couldn't play [${song.title}](${song.url})`,
				}),
			);

			this.skip();
		});

		await this.updatePresence();

		this.setState({
			stream,
			state: "playing",
		});

		const dispatcher = this.state.connection.play(stream, {
			highWaterMark: 512,
		});
		dispatcher.on("finish", () => this.skip());
	};

	resume = () => {
		this.resumeStreams();
		this.setState({
			state: "playing",
		});
	};

	pause = async () => {
		const time = this.state.connection.dispatcher.streamTime;

		this.pauseStreams();
		this.setState({
			state: "paused",
			position: time,
		});
	};

	/**
	 *
	 * @param index number: indicates the nth song in the queue.
	 */
	jump = async (index: number) => {
		this.destroyStreams();

		this.setState({
			index,
		});

		if (this.state.state === "playing") this.play(true);
	};

	/**
	 *
	 * @param timestamp is the number of seconds to seek to.
	 */
	seek = (timestamp: number) => {
		this.destroyStreams();

		const song = this.state.queue[this.state.index];
		const stream = ytdl(song.url, { quality: "lowest" });

		const dispatcher = this.state.connection.play(stream, {
			highWaterMark: 512,
			seek: timestamp,
		});

		dispatcher.on("finish", () => this.skip());
	};

	/**
	 *
	 * @param command indicates whether a 'single' loop should jump to next song.
	 * This is for cases where user has loop = 'single' and wish to skip the
	 * looping song to loop the following, etc.
	 */
	skip = async (command = false) => {
		const { loop, index, queue } = this.state;

		this.destroyStreams();
		await this.clearPresence();

		if (index === queue.length - 1 && loop === "disabled") {
			this.clear();
			return;
		}

		if (index === queue.length - 1 && loop === "queue") {
			this.setState({
				index: 0,
			});
		} else if (loop === "single" && !command) {
			this.setState({
				index,
			});
		} else {
			this.setState({
				index: index + 1,
			});
		}

		if (this.state.state === "playing") this.play(true);
	};

	getCurrentStreamTime = () => {
		return this.state?.connection?.dispatcher?.streamTime;
	};

	getCurrentSong = () => {
		return this.state.queue[this.state.index];
	};

	loop = () => {
		this.setState({
			loop: LOOP_STATES[(LOOP_STATES.indexOf(this.state.loop) + 1) % 3],
		});
	};

	clear = () => {
		this.destroyStreams();

		this.setState({
			state: "stopped",
			index: 0,
			position: 0,
			stream: null,
			queue: [],
			dispatcher: null,
		});
	};

	connect = async (vc: VoiceChannel, text: TextChannel) => {
		if (!this.state.vc) {
			log(
				this.client,
				`Connecting to vc: ${vc.name}, text: ${text.name}`,
				"info",
			);

			this.setState({
				vc,
				text,
				connection: this.state.connection || (await vc.join()),
			});
		}
	};

	disconnect = async (reason = "User disconnected bot") => {
		log(this.client, `Disconnecting, reason: ${reason}`, "info");

		if (this.state.connection) this.state.connection.disconnect();
		this.destroyStreams();

		clearTimeout(this.state.timeout);

		await this.state.text.send(
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
			loop: "disabled",
		};
	};

	canUserPlay = (vc: VoiceChannel) => {
		return !this.state.vc || this.state.vc?.id === vc.id;
	};

	get queue() {
		return this.state.queue;
	}

	get playState() {
		return this.state.state;
	}

	get loopState() {
		return this.state.loop;
	}

	private updatePresence = async () => {
		const song = this.getCurrentSong();

		if (!song) return;

		await this.presence.addPresence({
			priority: true,
			activity: {
				name: song.title,
				type: "LISTENING",
				url: song.url,
			},
			status: "dnd",
		});
	};

	private clearPresence = async () => {
		await this.presence.clearSource("music");
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

	private shouldTimeout = () => {
		return (
			this.state.vc &&
			(isChannelEmpty(this.state.vc) ||
				this.state.queue.length === 0 /* empty queue */ ||
				this.state.state === "paused" ||
				this.state.state === "stopped" ||
				this.state.connection?.voice?.serverMute)
		);
	};

	private resumeStreams = () => {
		this.state.stream?.resume?.();
		this.state.connection?.dispatcher?.resume?.();
	};

	private destroyStreams = () => {
		if (this.state.stream) {
			this.state.stream.destroy();
		}

		if (this.state.connection?.dispatcher) {
			this.state.connection.dispatcher.destroy();
		}
	};

	private pauseStreams = () => {
		if (this.state.stream) {
			this.state.stream.pause();
		}

		if (this.state.connection?.dispatcher) {
			this.state.connection.dispatcher.pause();
		}
	};
}
