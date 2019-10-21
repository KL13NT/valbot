const fs = require('fs')


export default class Logger{
  constructor (data, type, logsDirectory) {
    
    this.POSSIBLE_TYPES = [
      'info',
      'warning',
      'error'
    ]
    
    this.data = data
    this.type = type
    this.date = new Date().toLocale
    
    this.logsDirectory = logsDirectory
    this.filename = `${ this.date.getUTCFullYear() }-${ this.date.getUTCMonth() }-${ this.date.getUTCDate() }`
    
    this.isFileCreated = false
    this.isValid = this.POSSIBLE_TYPES.findIndex(type) === -1 ? false : true
    
    this.initialiseLogger()
  }

  log (data, type) {
    
  }

  // isFileCreated (pathToFolder) { //TODO: take this into FileUtils class [FOLDERS]
  //   return fs.readdirSync(pathToLogsFolder, 'utf-8')
  //     .map(filename => filename.replace(/\.(js|txt)/ig, ''))
  //     .findIndex(filename => filename === this.filename)
  // }

  isFileCreated (pathToFile) { //[FILES]
    return fs.existsSync(pathToFile)
  }

  initialiseLogger (pathToLogsFolder) {
    this.setInterval(() => {
      if (!this.isFileCreated(pathToLogsFolder)) { //non-strict comparison until making sure that it returns bool
        fs.writeFileSync(`${pathToLogsFolder}/${this.filename}`, '', 'UTF-8')
      }
    }, 24 * 60 *  60 * 1000) //day
  }
}

fs.writeFile('', data, callback)