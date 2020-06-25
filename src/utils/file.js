const fs = require('fs');
const path = require('path');

/**
 * By default all methods require a __dirname as the last argument to resolve a path. This is to abstract away the use of `path.resolve`. You can also set a default through the constructor. All operations are sync by default & may throw fs errors when they occur. Handle these exceptions yourself. Uses utf-8
 */
class FileUtils {
	static FSExists = fs.existsSync
	static FSRead = fs.readFileSync
	static FSReplace = fs.writeFileSync
	static FSAppend = fs.appendFileSync
	static FSReadDir = fs.readdirSync
	static FSResolve = path.resolve

	/**
	 * Checks whether directory exists
	 * @param {string} dirPath path to directory
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @returns boolean indicating whether directory exists
	 */
	static dirExists(dirPath, dirname) {
		return fs.stat(this.FSResolve(dirname, dirPath), (err, stat) => {
			if (stat) return true;
			return false;
		});
	}

	/**
	 * Checks whether file exists
	 * @param {string} filePath path to file
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @returns boolean indicating whether file exists
	 */

	static fileExists(filePath, dirname) {
		return this.FSExists(this.FSResolve(dirname, filePath));
	}

	/**
	 * Creates a new directory
	 * @param {string} dirPath path to directory
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 */
	static createDir(dirPath, dirname) {
		fs.mkdirSync(this.FSResolve(dirname, dirPath));
	}

	/**
	 * Creates new file with optional contents
	 * @param {string} filePath path to file
	 * @param {string} [content] optional data to append
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @throws if file already exists
	 */

	static create(filePath, content = '', dirname) {
		if (this.fileExists(dirname, filePath))
			throw Error('File already exists, maybe use append instead?');
		else this.FSReplace(path.resolve(dirname, filePath), content, 'utf-8');
	}

	/**
	 * Replaces given file with new contents
	 * @param {string} filePath path to file
	 * @param {string} content data to replace with
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @throws if file doesn't exist
	 */

	static replace(filePath, content, dirname) {
		if (this.fileExists(filePath, dirname))
			this.FSReplace(path.resolve(dirname, filePath), content, 'utf-8');
		else this.create(filePath, content, dirname);
	}

	/**
	 * Appends new contents to file
	 * @param {string} filePath path to file
	 * @param {string} content data to append
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 */
	static append(filePath, content, dirname) {
		if (this.fileExists(filePath, dirname))
			this.FSAppend(path.resolve(dirname, filePath), content, 'utf-8');
		else throw Error('File does not exist, maybe use create instead?');
	}

	/**
	 * Reads contents of file
	 * @param {string} filePath path to file
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @returns contents of file
	 */
	static read(filePath, dirname) {
		return this.FSRead(path.resolve(dirname, filePath), 'utf-8');
	}

	/**
	 * Reads contents of directory
	 * @param {string} folderPath The path to the required directory
	 * @param {string} [dirname] Node's __dirname, can be assigned through the constructor
	 * @returns an array of file names in the current folder or `false` in case of error
	 */
	static readDir(folderPath, dirname) {
		return [...this.FSReadDir(path.resolve(dirname, folderPath))];
	}
}

module.exports = FileUtils;
