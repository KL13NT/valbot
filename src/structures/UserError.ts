/**
 * Used for bot-specific errors that can be returned to the user
 */
export default class UserError extends Error {
	context: Record<string, string>;

	constructor(message: string, context?: Record<string, string>) {
		super(message);

		this.context = context;
	}
}
