const fs = require(`fs`)
const path = require(`path`)

module.exports = class FileUtils {
  //This module is created as a Sync module to make sure i/o operations happen in series and not cause conflics
  constructor (){

    const methods = {
      FSExists: fs.existsSync,
      FSRead: fs.readFileSync,
      FSReplace: fs.writeFileSync,
      FSAppend: fs.appendFileSync,
      FSReadDir: fs.readdirSync
    }

    Object.assign(this, methods)
  }

  /**
   * Checks whether file exists
   * @param {string} dirname 
   * @param {string} filepath 
   */

  dirExists (dirname){
    let exists = false
		
    fs.stat(dirname, (err, stat) => {
      if(stat) exists = true
    })
	
    return exists
  }
	
  createDir (dirname){
    try{
      fs.mkdirSync(dirname)
    }
    catch(err){
      return false
    }
  }

  fileExists (dirname = ``, filepath){
    try {
      return this.FSExists(path.resolve(dirname, filepath))
    }
    catch(err){
      console.log(err)
    }
  }

  /**
   * 
   * @param {string} dirname 
   * @param {string} filepath 
   * @param {string} content 
   */
  create (dirname = ``, filepath, content){
    if(this.fileExists(dirname, filepath)) throw Error(`File already exists, did you mean to use append?`)
    else this.FSReplace(path.resolve(dirname, filepath), content, `utf-8`)
  }

  /**
   * 
   * @param {string} dirname
   * @param {string} filepath
   * @param {string} content
   */
  replace (dirname = ``, filepath, content){
    if(this.fileExists(dirname, filepath)) this.FSReplace(path.resolve(dirname, filepath), content, `utf-8`)
    else throw Error(`File doesn't exist, did you mean to use create?`)
  }

  /**
   * 
   * @param {string} dirname 
   * @param {string} filepath 
   * @param {string} content 
   */
  append (dirname = ``, filepath, content){
    try{
      this.FSAppend(path.resolve(dirname, filepath), content, `utf-8`)
    }
    catch(err){
      console.log(err)
    }
  }

  /**
   * 
   * @param {string} dirname 
   * @param {string} filepath 
   */
  read (dirname = ``, filepath){
    try {
      return this.FSRead(path.resolve(dirname, filepath), `utf-8`)
    }
    catch(err){
      console.log(err)
    }
  }

  /**
   * 
   * @param {string} dirname 
   * @param {string} folderpath 
   */
  readdir (dirname, folderpath){
    try {
      return [ ...this.FSReadDir(path.resolve(dirname, folderpath)) ]
    }
    catch(err){
      console.log(err)
    }
  }
}