import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { Snowflake, TextChannel, VoiceBasedChannel, VoiceChannel, VoiceState } from "discord.js";
import {
	joinVoiceChannel,
	VoiceConnection,
	AudioPlayer,
	NoSubscriberBehavior,
	createAudioResource,
	getVoiceConnection,
	VoiceConnectionStatus,
	createAudioPlayer,
	entersState,
	AudioResource,
} from "@discordjs/voice";
import { ObjectId } from "bson";

import ValClient from "../ValClient";
import MongoController from "./MongoController";
import UserError from "../structures/UserError";
import logger from "../utils/logging";
import { Controller } from "../structures";
import { createEmbed } from "../utils/embed";
import { PresenceController } from "./index";
import { Destroyable, Playlist, Song } from "../types/interfaces";
import { Track } from "../entities/music/types";
import { YoutubeTrack } from "../entities/music/YouTubeBehavior";
import { handleUserError, retryRequest } from "../utils/apis";

export type Seconds = number;
export type LoopState = "single" | "queue" | "disabled";
export type PlayState = "stopped" | "paused" | "playing" | "fetching"; //TODO: change to enum

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
	vc: VoiceBasedChannel;

	/** ytdl play stream */
	resource: AudioResource | null;

	/** Voice connection for current instance */
	connection: VoiceConnection;

	/** Timeout number for disconnecting after period of time */
	timeout: NodeJS.Timeout;

	/** The connection.play dispatcher, used for seeking and other ops */
	player: AudioPlayer | null;

	/** Looping mode
	 * @default 'disabled'
	 */
	loop: LoopState;

	/** The shuffle state */
	shuffle: boolean;

	/** Playing interval for calculating current position */
	// interval: NodeJS.Timeout;
}

const DISCONNECT_AFTER = 15 * 60 * 1000; // 15 minutes
const LOOP_STATES: LoopState[] = ["disabled", "queue", "single"];

export default class MusicController extends Controller implements Destroyable {
	private presence: PresenceController;
	private mongo: MongoController;
	private resolver: YoutubeTrack;
	private state: MusicControllerState = {
		state: "stopped",
		index: 0,
		position: 0,
		queue: [],
		text: null,
		vc: null,
		timeout: null,
		player: null,
		resource: null,
		connection: null,
		loop: "disabled",
		shuffle: false,
	};

	constructor(client: ValClient) {
		super(client, {
			name: "music",
		});
	}

	init = async () => {
		this.resolver = new YoutubeTrack();
		this.mongo = this.client.controllers.get("mongo") as MongoController;
		this.presence = this.client.controllers.get(
			"presence",
		) as PresenceController;

		this.client.on("voiceStateUpdate", this.handleStateUpdate);
	};

	destroy = async () => {
		this.client.off("voiceStateUpdate", this.handleStateUpdate);
		this.state.player?.stop?.();
		await this.clearPresence();
	};

	handleStateUpdate = (oldState: VoiceState, newState: VoiceState) => {
		if (newState.channel?.id && newState.member.id === this.client.user.id)
			this.setState({
				vc: newState.channel as VoiceChannel,
			});

		if (
			oldState.channel?.id === this.state.vc?.id ||
			newState.channel?.id === this.state.vc?.id
		)
			this.setState({});
	};

	enqueue = (input: Track | Track[], requestingUserId: Snowflake) => {
		const queue = Array.isArray(input)
			? input.map((track, index) => ({
					...track,
					requestingUserId,
					id: this.state.queue.length + index,
			  }))
			: [
					{
						...input,
						requestingUserId,
						id: this.state.queue.length,
					},
			  ];

		this.setState({
			queue: [...this.state.queue, ...queue],
		});
	};

	/**
	 *
	 * @param force a boolean to force a play, used when internal skipping
	 * @param position a number indicating position to seek to
	 * @returns
	 */
	play = async (force = false, position = 0) => {
		try {
			const connection = this.state.connection;

			if (
				!connection ||
				this.state.queue.length === 0 ||
				(this.state.state === "playing" && !force)
			) {
				return;
			}

			const current = this.state.queue[this.state.index];
			const song = current.spotify
				? await retryRequest(() => this.resolver.fetch(current.title))
				: current;

			logger.info(`Starting to play ${song.title} at position ${position}`);

			const info = await ytdl.getInfo(song.url, {
				requestOptions: {
					headers: {
						cookie: process.env.COOKIE,
					},
				},
			});

			const hasAudio = info.formats
				.filter(format => format.hasAudio)
				.sort((a, b) => a.bitrate - b.bitrate);

			if (hasAudio.length === 0)
				throw new UserError("This video doesn't have audio");

			logger.info(`Selected ${hasAudio[0].audioQuality}-${hasAudio[0].codecs}`);

			const stream = ffmpeg({
				logger,
				source: ytdl.downloadFromInfo(info, {
					format: hasAudio[0],
				}),
			})
				.toFormat("mp3")
				.seekInput(position);

			stream.on("error", async error => {
				handleUserError(error, this.state.text);

				this.skip();
			});

			const player = createAudioPlayer({
				debug: process.env.MODE === "DEVELOPMENT",
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play,
				},
			});

			const audioPlayerResource = createAudioResource(stream, {
				silencePaddingFrames: 0,
				inlineVolume: true,
			});

			player.play(audioPlayerResource);
			connection.subscribe(player);

			audioPlayerResource.playStream.on("end", () => this.skip());

			await this.updatePresence();

			this.setState({
				position,
				player,
				connection,
				resource: audioPlayerResource,
				state: "playing",
			});
		} catch (error) {
			logger.error(error);
			handleUserError(error, this.state.text);
		}
	};

	resume = () => {
		this.state.player.unpause();
		// this.seek(guildId, this.state.position);
		this.setState({
			state: "playing",
		});
	};

	pause = async () => {
		this.state.player.pause(true);

		this.setState({
			state: "paused",
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
		this.play(true, timestamp);
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

		if (index === queue.length - 1 && ["disabled", "single"].includes(loop)) {
			await this.clear();
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

		if (["playing", "paused"].includes(this.state.state)) this.play(true);
	};

	refresh = async () => {
		const time = this.state.resource.playbackDuration / 1000;

		this.destroyStreams();

		this.setState({
			position: this.state.position + time,
		});

		this.seek(this.state.position);
	};

	/**
	 *
	 * @param songIndex is the index of the song in the queue.
	 */
	remove = async (songIndex: number) => {
		if (songIndex > this.state.index) {
			this.setState({
				queue: this.state.queue.filter((_, index) => index !== songIndex),
			});
		} else {
			this.setState({
				queue: this.state.queue.filter((_, index) => index !== songIndex),
				index: this.state.index - 1,
			});
		}
	};

	/**
	 *
	 * @param songIndex is the index of the song to be moved.
	 * @param newIndex is the new index of the song.
	 */
	move = (songIndex: number, newIndex: number) => {
		const currentIndex = this.state.index;
		const movingSong: Song = this.state.queue[songIndex];

		const filtered = this.state.queue.filter(
			(_: Song, index: number) => index !== songIndex,
		);

		const targetDirection = currentIndex - newIndex > 0 ? 1 : -1;
		const sourceDirection = currentIndex - songIndex > 0 ? 1 : -1;
		const newCurrentlyPlayingIndex =
			targetDirection === sourceDirection
				? currentIndex
				: currentIndex + targetDirection;

		filtered.splice(newIndex, 0, movingSong);

		this.setState({
			queue: filtered,
			index: newCurrentlyPlayingIndex,
		});
	};

	shuffle = () => {
		const { queue, shuffle, index: songIndex } = this.state;
		const upNext = queue.filter((_, index) => index > songIndex);
		const alreadyPlayed = queue.filter((_, index) => index <= songIndex);

		if (shuffle) upNext.sort((a, b) => (a.id < b.id ? -1 : 1));
		else upNext.sort(() => Math.random() - 0.5);

		this.setState({
			queue: [...alreadyPlayed, ...upNext],
			index: songIndex,
			shuffle: !shuffle,
		});
	};

	getCurrentStreamTime = () => {
		return this.state?.resource?.playbackDuration;
	};

	getCurrentPosition = () => {
		return this.state.position;
	};

	getCurrentSong = () => {
		return this.state.queue[this.state.index];
	};

	loop = (state?: LoopState) => {
		const toggled = LOOP_STATES[(LOOP_STATES.indexOf(this.state.loop) + 1) % 3];
		const loop = !state ? toggled : state;

		this.setState({
			loop,
		});

		return loop;
	};

	clear = async () => {
		this.destroyStreams();

		await this.clearPresence();

		this.setState({
			timeout: null,
			state: "stopped",
			index: 0,
			position: 0,
			queue: [],
			player: null,
		});
	};

	connect = async (vc: VoiceBasedChannel, text: TextChannel) => {
		const connection = getVoiceConnection(vc.guildId);

		if (connection) {
			logger.info(`Already connected to vc: ${vc.name}, text: ${text.name}`);
			return connection;
		}

		logger.info(`Connecting to vc: ${vc.name}, text: ${text.name}`);

		const newConnection = joinVoiceChannel({
			channelId: vc.id,
			adapterCreator: vc.guild.voiceAdapterCreator,
			guildId: vc.guildId,
		});

		newConnection.on(VoiceConnectionStatus.Destroyed, this.disconnect);

		newConnection.on(VoiceConnectionStatus.Disconnected, async () => {
			try {
				await Promise.race([
					entersState(newConnection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(newConnection, VoiceConnectionStatus.Connecting, 5_000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				newConnection.destroy();
			}
		});

		this.setState({
			vc,
			text,
			connection: newConnection,
		});

		return newConnection;
	};

	disconnect = async () => {
		try {
			logger.info("Disconnected from vc");

			this.destroyStreams();
			this.clearPresence();

			clearTimeout(this.state.timeout);

			if (this.state.text)
				await this.state.text.send({
					embeds: [
						createEmbed({
							description: "Disconnected from voice channel",
						}),
					],
				});
		} catch (error) {
			logger.info("Disconnected from vc");
		} finally {
			this.state = {
				text: null,
				vc: null,
				queue: [],
				state: "stopped",
				timeout: null,
				position: 0,
				index: 0,
				player: null,
				connection: null,
				resource: null,
				loop: "disabled",
				shuffle: false,
			};
		}
	};

	canUserPlay = (vc: VoiceBasedChannel) => {
		return !this.state.vc || this.state.vc?.id === vc.id;
	};

	/**
	 *
	 * @throws
	 */
	getUserPlaylists = async (userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const found = await this.mongo.db
			.collection<Playlist>("playlists")
			.find({ userId })
			.toArray();

		return found;
	};

	/**
	 *
	 * @throws
	 */

	getAllPlaylists = async () => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const found = await this.mongo.db
			.collection<Playlist>("playlists")
			.find()
			.toArray();

		return found;
	};

	/**
	 *
	 * @throws
	 */

	getPlaylist = async (name: string) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const id = name.toLowerCase();

		return this.mongo.db.collection<Playlist>("playlists").findOne({
			$or: [
				{
					id,
				},
				{
					name,
				},
			],
		});
	};

	/**
	 *
	 * @throws
	 */
	loadPlaylist = async (name: string, userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const playlist = await this.getPlaylist(name);
		if (!playlist) throw new UserError("No playlist with this name exists");

		this.setState({
			queue: playlist.queue.map(song => ({
				...song,
				requestingUserId: userId,
			})),
			index: 0,
			shuffle: false,
		});
	};

	/**
	 *
	 * @throws
	 */

	appendPlaylist = async (name: string, userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const playlist = await this.getPlaylist(name);
		if (!playlist) throw new UserError("No playlist with this name exists");

		const newQueue = playlist.queue.map(song => ({
			...song,
			requestingUserId: userId,
		}));

		this.setState({
			queue: this.queue.concat(newQueue),
		});
	};
	/**
	 *
	 * @throws
	 */

	createPlaylist = async (name: string, userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const id = name.toLowerCase();
		const found = await this.getPlaylist(name);

		if (found)
			throw new UserError(
				`A playlist with this name already exists by user <@!${found.userId}>`,
			);

		const result = await this.mongo.db
			.collection<Playlist>("playlists")
			.insertOne({
				id,
				name,
				queue: this.state.queue,
				userId,
			});

		if (!result.result.ok) throw new UserError("Failed to create playlist");
	};

	/**
	 *
	 * @throws
	 */
	deletePlaylist = async (name: string, userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const found = await this.getPlaylist(name);
		if (!found) throw new UserError("No playlist with this name exists");

		if (found && found.userId !== userId)
			throw new UserError("This playlist doesn't belong to this user");

		const results = await this.mongo.db.collection("playlists").deleteOne({
			_id: new ObjectId(found._id),
		});

		if (!results.result.ok) throw new UserError("Failed to delete playlist");
	};

	/**
	 *
	 * @throws
	 */
	updatePlaylist = async (name: string, userId: Snowflake) => {
		if (!this.mongo.ready) throw new UserError("The database is not ready yet");

		const found = await this.getPlaylist(name);
		if (!found) throw new UserError("No playlist with this name exists");

		if (found && found.userId !== userId)
			throw new UserError("This playlist doesn't belong to this user");

		const results = await this.mongo.db.collection("playlists").updateOne(
			{ _id: found._id },
			{
				$set: {
					queue: found.queue.concat(this.state.queue),
				},
			},
		);

		if (!results.result.ok) throw new UserError("Failed to update playlist");
	};

	get queue() {
		return this.state.queue;
	}

	get playState() {
		return this.state.player?.state?.status || "stopped";
	}

	get currentSongIndex() {
		return this.state.index;
	}

	get loopState() {
		return this.state.loop;
	}

	get shuffleState() {
		return this.state.shuffle;
	}

	private updatePresence = async () => {
		const song = this.getCurrentSong();

		if (!song) return;

		await this.presence.addPresence({
			priority: true,
			activities: [
				{
					name: song.title,
					type: "LISTENING",
					url: song.url,
				},
			],
			source: "music",
			status: "dnd",
		});
	};

	private clearPresence = async () => {
		await this.presence.clearSource("music");
	};

	private setState = (update: Partial<MusicControllerState>) => {
		const indexChanged = typeof update.index !== "undefined";
		const position = indexChanged ? 0 : update.position ?? this.state.position;

		this.state = {
			...this.state,
			...update,
			position,
		};

		this.onStateChanged();
	};

	private onStateChanged = async () => {
		if (!this.shouldTimeout()) {
			clearTimeout(this.state.timeout);
			this.state.timeout = null;
			return;
		}

		if (this.shouldTimeout() && !this.state.timeout) {
			const timeout = this.state?.vc?.guild?.afkTimeout;

			this.state.timeout = setTimeout(
				() => this.disconnect(),
				timeout ? timeout * 1000 : DISCONNECT_AFTER,
			);
		}
	};

	private shouldTimeout = () => {
		return (
			this.state.vc &&
			(this.state.vc.members.size === 1 ||
				this.state.queue.length === 0 /* empty queue */ ||
				this.state.state === "paused" ||
				this.state.state === "stopped")
		);
	};

	private destroyStreams = () => {
		if (this.state.resource) {
			this.state.resource.playStream.destroy();
		}
	};
}
