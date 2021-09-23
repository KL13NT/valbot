import { QueueController } from ".";
import { Controller } from "../structures";
import { Presence } from "../types/interfaces";
import { log } from "../utils/general";
import ValClient from "../ValClient";

export default class PresenceController extends Controller {
	private presences: Presence[] = [
		{
			status: "dnd",
			activity: {
				name: `${this.client.prefix}help`,
				type: "LISTENING",
			},
			priority: false,
		},
	];

	constructor(client: ValClient) {
		super(client, {
			name: "presence",
		});
	}

	init = async () => {
		setInterval(this.updatePresence, 30 * 1000);
		this.updatePresence();
	};

	addPresence = (presence: Presence) => {
		this.presences.unshift(presence);
		this.updatePresence();
	};

	clearPriority = () => {
		this.presences = this.presences.filter(p => !p.priority);
		this.updatePresence();
	};

	private updatePresence = async () => {
		const presence = this.getRandomPresence();
		const presenceWithPriority = this.presences.find(p => p.priority);
		const queue = this.client.controllers.get(
			"QueueController",
		) as QueueController;

		if (this.client.user) {
			this.client.user
				.setPresence(presenceWithPriority || presence)
				.catch((err: Error) => log(this.client, err, "error"));

			return;
		}

		queue.enqueue({
			args: [],
			func: this.updatePresence,
		});
	};

	private getRandomPresence = () =>
		this.presences[Math.floor(Math.random() * this.presences.length)];
}
