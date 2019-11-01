const FileUtils = new (require(`./FileUtils`))()

/**
 * @constructor
 * @param data
 * @param type
 * @param logsDir
 */
module.exports = class Logger{
  constructor (logsDir) {
    
    this.colors = {
      info: `\x1b[36m`,
      warning: `\x1b[43m\x1b[30m`,
      error: `\x1b[31m`,
      reset: `\x1b[0m`
    }

    this.name = new Date().toLocaleDateString(`uk`)
    this.logsDir = logsDir
    this.isFileCreated = false

    this.checkFile()
  }


  checkFile (){
    console.log(FileUtils.readdir(``, this.logsDir).find(file => file === this.name))
  }

  console (data, type) {
    
  }

  // initialiseLogger (pathToLogsFolder) {
  //   this.setInterval(() => {
  //     if (!this.isFileCreated(pathToLogsFolder)) { //non-strict comparison until making sure that it returns bool
  //       fs.writeFileSync(`${pathToLogsFolder}/${this.filename}`, ``, `UTF-8`)
  //     }
  //   }, 24 * 60 *  60 * 1000) //day
  // }
}
