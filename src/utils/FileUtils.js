const fs = require(`fs`)
const path = require(`path`)


/**
 * By default all methods require a __dirname as the last argument to resolve a path. This is to abstract away the use of `path.resolve`. You can also set a default through the constructor. All operations are sync by default & may throw fs errors when they occur. Handle these exceptions yourself. Uses utf-8
 */
class FileUtils {
	/**
	 * @constructor
	 * @param {string} [dirname = undefined] NodeJS __dirname
	 */
	constructor (dirname){

		this.dirname = dirname

		const methods = {
			FSExists: fs.existsSync,
			FSRead: fs.readFileSync,
			FSReplace: fs.writeFileSync,
			FSAppend: fs.appendFileSync,
			FSReadDir: fs.readdirSync,
			FSResolve: path.resolve
		}

		Object.assign(this, methods)
	}

	/**
   * Checks whether directory exists
	 * @param {string} dirPath path to directory
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @returns boolean indicating whether directory exists
   */
	dirExists (dirPath, dirname = this.dirname){
		return fs.stat(this.FSResolve(dirname, dirPath), (err, stat) => {
			if(stat) return true
			return false
		})
	}

	/**
	 * Checks whether file exists
	 * @param {string} filePath path to file
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @returns boolean indicating whether file exists
   */

	fileExists (filePath, dirname = this.dirname){
		return this.FSExists(this.FSResolve(dirname, filePath))
	}

	/**
	 * Creates a new directory
	 * @param {string} dirPath path to directory
	 * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 */
	createDir (dirPath, dirname = this.dirname){
		fs.mkdirSync(this.FSResolve(dirname, dirPath))
	}

	/**
   * Creates new file with optional contents
	 * @param {string} filePath path to file
	 * @param {string} [content] optional data to append
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @throws if file already exists
   */

	create (filePath, content = ``, dirname = this.dirname){
		if(this.fileExists(dirname, filePath)) throw Error(`File already exists, maybe use append instead?`)
		else this.FSReplace(path.resolve(dirname, filePath), content, `utf-8`)
	}

	/**
   * Replaces given file with new contents
	 * @param {string} filePath path to file
	 * @param {string} content data to replace with
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @throws if file doesn't exist
   */

	replace (filePath, content, dirname = this.dirname){
		if(this.fileExists(filePath, dirname))
			this.FSReplace(path.resolve(dirname, filePath), content, `utf-8`)

		else throw Error(`File doesn't exist, maybe use create instead?`)
	}

	/**
   * Appends new contents to file
	 * @param {string} filePath path to file
	 * @param {string} content data to append
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
   */
	append (filePath, content, dirname = this.dirname){
		if(this.fileExists(filePath, dirname))
			this.FSAppend(path.resolve(dirname, filePath), content, `utf-8`)

		else throw Error(`File doesn't exist, maybe use create instead?`)
	}

	/**
   * Reads contents of file
   * @param {string} filePath path to file
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @returns contents of file
   */
	read (filePath, dirname = this.dirname){
		return this.FSRead(path.resolve(dirname, filePath), `utf-8`)
	}

	/**
	 * Reads contents of directory
   * @param {string} folderPath The path to the required directory
   * @param {string} [dirname = this.dirname] Node's __dirname, can be assigned through the constructor
	 * @returns an array of file names in the current folder or `false` in case of error
   */
	readDir (folderPath, dirname = this.dirname){
		return [ ...this.FSReadDir(path.resolve(dirname, folderPath)) ]
	}
}

module.exports = FileUtils