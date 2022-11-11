import { Controller } from "../structures";
import { Presence } from "../types/interfaces";
import logger from "../utils/logging";
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

	addPresence = async (presence: Presence) => {
		if (presence.priority) await this.clearPriority();

		this.presences.unshift(presence);
		await this.updatePresence();
	};

	clearPriority = async () => {
		this.presences = this.presences.filter(p => !p.priority);
		await this.updatePresence();
	};

	clearSource = async (source: string) => {
		this.presences = this.presences.filter(
			presence => presence.source !== source,
		);
		await this.updatePresence();
	};

	private updatePresence = async () => {
		const presence = this.getRandomPresence();
		const presenceWithPriority = this.presences.find(p => p.priority);
		const current = presenceWithPriority || presence;

		if (!this.client.user) return;

		this.client.user
			.setPresence(current)
			.catch((err: Error) => logger.error(err));
	};

	private getRandomPresence = () =>
		this.presences[Math.floor(Math.random() * this.presences.length)];
}
