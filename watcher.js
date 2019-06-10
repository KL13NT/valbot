const process = require('process')
const cp = require('child_process')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function ls() {
  const { stdout, stderr } = await exec('yarn jsdoc index.js')
  stderr? console.log('JSDOC EXECUTION ERROR\n', stderr): console.log(stdout)
}

let server = cp.fork('index.js')
console.log('Server started')
ls()

fs.watchFile('index.js', function (event, filename) {
  ls()
  server.kill()
  console.log('Server restarting')
  server = cp.fork('index.js')
  
})

process.on('SIGINT', function () {
  server.kill()
  fs.unwatchFile('index.js')
  console.log('Server terminated')
  console.log('Watcher terminated')
  process.exit()
})