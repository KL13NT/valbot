import { EventOptions } from '../types/interfaces';

/**
 * Generates an event string dynamically based on events.json
 */
function createEventMessage({ template, variables }: EventOptions) {
	return variables.reduce((result, variable) => {
		return result.replace(new RegExp(`{{${variable.name}}}`), variable.value);
	}, template);
}

module.exports = {
	createEventMessage
};
