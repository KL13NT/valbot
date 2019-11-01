const FileUtils = new (require(`./FileUtils`))()

/**
 * @constructor
 * @param data
 * @param type
 * @param logsDir
 */
module.exports = class Logger{
  constructor (dirname, logsDir) {
    
    this.colors = {
      info: `\x1b[36m`,
      warn: `\x1b[43m\x1b[30m`,
      error: `\x1b[31m`,
      reset: `\x1b[0m`
    }

    this.isLogging = process.env.MODE === `DEVELOPMENT`? false: true
    this.logName = this.constructFileName()
    this.dirname = dirname
    this.logsDir = logsDir
    this.logPath = `${this.logsDir}/${this.logName}`

    if(!FileUtils.fileExists(this.dirname, this.logPath)) {
      FileUtils.create(dirname, this.logPath, ``)
    }

    this.startLogging()
  }


  startLogging (){
    this.console(`Log started on ${this.logName} ${new Date().toLocaleTimeString()}\n`, `info`)
    FileUtils.append(this.dirname, this.logPath, `\n\nLog started on ${this.logName} ${new Date().toLocaleTimeString()}\n`)
  }

  constructFileName (){
    const date = new Date()
    const day = date.getUTCDate()
    const month = date.getUTCMonth()
    const year = date.getUTCFullYear()
    
    const filename = `${day}-${month}-${year}`
    return filename
  }

  file (data, type){
    // if(!this.isLogging) return this.console(data, type) //fallback for when developing to avoid clutter and space waste

    const date = new Date()
    
    if(this.verifyLogType(type)){
      FileUtils.append(this.dirname, this.logPath, `[${String.prototype.toUpperCase.call(type)} ${date.toLocaleTimeString()}] ${JSON.stringify(data, undefined, `\n`)}\n`)
    }
    else console.log(`Log type is wrong!`)
  }

  console (data, type) {
    if(this.verifyLogType(type)){
      console.log(`${this.colors[type]}`, data, `${this.colors[`reset`]}`)
    }
    else console.log(`Log type is wrong!`)
  }

  verifyLogType (type){
    return Object.keys(this.colors).includes(type)
  }

  readLog (dirname, filepath){
    const log = FileUtils.read(dirname, filepath)
    console.log(log)
  }
}
