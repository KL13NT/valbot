class Queue {
	constructor (client){
		this.client = client
		this.calls = []
	}

	enqueue (func, ...args) {
		this.calls.push({
			func,
			args
		})
	}

	executeAll () {
		this.calls.forEach(({ func, args }) => {
			func.apply(this, args)
		})
	}

}

module.exports = Queue