import Joi from '@hapi/joi';

export const IDValidator = Joi.string()
	.required()
	.pattern(new RegExp('[0-9]+'));

export const ClientConfigValidator = Joi.object({
	AUTH_ADMIN: IDValidator,
	AUTH_MOD: IDValidator,
	AUTH_VERIFIED: IDValidator,
	AUTH_EVERYONE: IDValidator,

	CHANNEL_NOTIFICATIONS: IDValidator,
	CHANNEL_ANNOUNCEMENTS: IDValidator,
	CHANNEL_RULES: IDValidator,
	CHANNEL_POLLS: IDValidator,
	CHANNEL_TEST: IDValidator,
	CHANNEL_BOT_STATUS: IDValidator,
	CHANNEL_MOD_LOGS: IDValidator,
	CHANNEL_BOT_BUGS: IDValidator,

	ROLE_MUTED: IDValidator,
	ROLE_WARNED: IDValidator
});
