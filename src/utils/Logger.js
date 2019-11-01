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
      warning: `\x1b[43m\x1b[30m`,
      error: `\x1b[31m`,
      reset: `\x1b[0m`
    }

    this.logName = this.constructFileName()
    this.dirname = dirname
    this.logsDir = logsDir
    this.logPath = `${this.logsDir}/${this.logName}`

    if(!FileUtils.fileExists(this.dirname, this.logPath)) {
      FileUtils.create(dirname, this.logPath, `Log started on ${this.logName}-${new Date().toLocaleTimeString()}.\n\n`)
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

  file (data, type){
    const date = new Date()
    
    if(this.verifyLogType(type)){
      FileUtils.append(this.dirname, this.logPath, `[${String.prototype.toUpperCase.call(type)} ${date.toLocaleTimeString()}] ${data}\n`)
    }
    else console.log(`Log type is wrong!`)
  }

  console (data, type) {
    
  }

  verifyLogType (type){
    return Object.keys(this.colors).includes(type)
  }

  // initialiseLogger (pathToLogsFolder) {
  //   this.setInterval(() => {
  //     if (!this.isFileCreated(pathToLogsFolder)) { //non-strict comparison until making sure that it returns bool
  //       fs.writeFileSync(`${pathToLogsFolder}/${this.filename}`, ``, `UTF-8`)
  //     }
  //   }, 24 * 60 *  60 * 1000) //day
  // }
}
