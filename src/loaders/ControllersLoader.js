const { Loader } = require('../structures')
const Controllers = require('../Controllers')

const { log } = require('../utils/utils')

/**
 * Loads Controllers based on Controllers/index
 */
class ControllersLoader extends Loader{
	/**
	 *
	 * @param {ValClient} client used to attach loaded Controllers
	 */
	constructor (client) {
		super(client)
	}

	load () {
		Controllers.forEach(controller => {
			const controllerInstance = new controller(this.client)
			global[controllerInstance.constructor.name] = controllerInstance

			log(this.client, `${controller.name} loaded`, 'info')
		})
	}
}

module.exports = ControllersLoader