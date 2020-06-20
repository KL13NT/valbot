const Discord = require('discord.js')
/**
 * @typedef EventVariable
 * @property {string} name
 * @property {string|number} variable
 */

/**
 * @typedef EventOptions
 * @property {string} template String to be filled
 * @property {[EventVariable]} variables Variables
 */

module.exports = class EventUtils {
	/**
	 * Generates an event string dynamically based on events.json
	 * @param {EventOptions} param1
	 */
	static createEventMessage({ template, variables }) {
		return variables.reduce((result, variable) => {
			return result.replace(new RegExp(`{{${variable.name}}}`), variable.value)
		}, template)
	}
}
