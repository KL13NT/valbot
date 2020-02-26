const FileUtils = new (require(`./FileUtils`))()

/**
 * @constructor
 * @param data
 * @param type
 * @param logsDir
 */
module.exports = class Logger{
	constructor (dirname) {
    
		this.colors = {
			info: `\x1b[36m`,
			warn: `\x1b[43m\x1b[30m`,
			error: `\x1b[31m`,
			reset: `\x1b[0m`
		}

		this.isLogging = process.env.MODE === `DEVELOPMENT`? false: true
		this.logName = this.constructFileName()
		this.dirname = dirname
		this.logsDir = `./logs`
		this.logPath = `${this.logsDir}/${this.logName}`
		this.error = false

		if(!FileUtils.dirExists(this.dirname)) {
			try{
				FileUtils.createDir(FileUtils.FSResolve(dirname, `./logs`))
			}
			catch(err){
				this.error = true
			}
		}
		if(!FileUtils.fileExists(this.dirname, this.logPath)) this.initLogFile()
    
	}
	
	//TODO: fix bug when file doesn't exist
	initLogFile (){
		if(this.error) return
		try{
			
			FileUtils.create(this.dirname, this.logPath, ``)
	
			this.console(`Log started on ${this.logName} ${new Date().toLocaleTimeString()}\n`, `info`)
			
			FileUtils.append(this.dirname, this.logPath, `\n\nLog started on ${this.logName} ${new Date().toLocaleTimeString()}\n`)
		}
		catch(err){
			console.log(err)
			this.error = true
		}
	}

	constructFileName (){
		const date = new Date()
		const day = date.getUTCDate()
		const month = date.getUTCMonth()
		const year = date.getUTCFullYear()
    
		const filename = `${day}-${month}-${year}`
		return filename
	}

	file (type, data){
		if(!this.isLogging) return this.console(type, data) //fallback for when developing to avoid clutter and space waste
		if(this.error) return

		try{
			const date = new Date()
			
			if(this.verifyLogType(type)){
				//TODO: if you need to stringify error objects in other areas, move this code to Utils
				const dataString = data instanceof Error ? JSON.stringify({ message: data.message, stack: data.stack }) : JSON.stringify(data)
				
				FileUtils.append(this.dirname, this.logPath, `[${String.prototype.toUpperCase.call(type)} ${date.toLocaleTimeString()}] ${dataString}\n`)
			}
			else console.log(`Log type is wrong!`)

		}
		catch(err){
			console.log(err)
		}
	}

	/**
   * Logs all arguments but the first one. First argument is the type, either 'error', 'warn', 'info'
   */
	console (type, ...data) {
		if(this.verifyLogType(type)){
			console.log(`${this.colors[type]}`, ...data, `${this.colors[`reset`]}`)
		}
		else console.log(`Log type is wrong!`)
	}

	verifyLogType (type){
		return Object.keys(this.colors).includes(type)
	}

	/**
   * Reads log files and returns an object containing both parsed data and raw data. Also accepts a call back that's passed those two types of data. 
   * @param {string} dirname 
   * @param {string} filepath 
   * @param {function} callback 
   */
	readLog (dirname, filepath, callback){
		if(this.error) return

		try{

			const lineStartReg = /(WARN|ERROR|INFO)/ig
			const rawLogs = FileUtils
				.read(dirname, filepath)
				.replace(/\n+/ig, `\n`)
			
			const logs = rawLogs
				.split(/\n/ig)
				.reduce((acc = [], curr, index) => {
					if(lineStartReg.test(curr)){ // make sure line is parse-able
						const key = curr.substr(0, curr.indexOf(`]`) + 1) // date and type
						const rawValue = curr.substr(curr.indexOf(`]`) + 1) // actual log value
						const [ type ] = curr.match(lineStartReg)
						let rawParsed //rawValue after parsing using JSON.parse
	
						if(/ERROR/gi.test(curr)) {
							// handling for malformed error objects 
							try {
								rawParsed = JSON.parse(rawValue)
								
								if(!rawParsed === `object`) throw Error(`Error value is not of type Object.`, rawParsed)
								if(!rawParsed.message || !rawParsed.stack) throw Error(`Error object is malformed, doesn't have message or stack.`, rawParsed)
								
								const value = new LogError(JSON.parse(rawValue))
								
								return [ ...acc, { key, value, type } ]
							}
							catch(err){
								this.console(`error`, `Error at log file line ${index + 1}`, err)
							}
						}
						else {
							return [ ...acc, { key, value: rawValue, type } ]
						}
					}
					else return acc
				}, [])
			
			if(callback) return callback(rawLogs, logs)
	
			return { rawLogs, logs }
		}
		catch(err){
			console.log(err)
		}
	}
}


class LogError extends Error{
	constructor (data){
		super(data.message)
		this.stack = data.stack 
	}
}