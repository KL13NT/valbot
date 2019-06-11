const process = require('process')
const cp = require('child_process')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function ls() {
  const { stdout, stderr } = await exec('documentation build **.js -f html -o documentation')
  stderr? console.log('JSDOC EXECUTION ERROR\n'): console.log(stdout)
}

let server = cp.fork('index.js')
console.log('Watcher started')
ls()

fs.watchFile('index.js', function (event, filename) {
  ls()
  server.kill()
  console.log('Server restarting')
  server = cp.fork('index.js')
  
})

fs.watchFile('commands.js', function (event, filename) {
  ls()
  console.log('Re-documenting')
})

process.on('SIGINT', function () {
  server.kill()
  fs.unwatchFile('index.js')
  fs.unwatchFile('commands.js')
  console.log('Watchers terminated')
  process.exit()
})