const process = require('process')
const cp = require('child_process')
const fs = require('fs')
const util = require('util')

// async function ls () {
//   const { stdout, stderr } = await exec('jsdoc . -d documentation -R DOCUMENTATION.md --configure .jsdoc.json')
//   stderr? console.log('JSDOC EXECUTION ERROR\n'): console.log(stdout)
// }


let server = cp.fork('index.prod.js')
console.log('Watcher started')

function restart (){
  server.kill()
  console.log('Server restarting')
  server = cp.fork('index.prod.js')
}

fs.watchFile('index.prod.js', restart)

process.on('SIGINT', function () {
  server.kill()
  fs.unwatchFile('index.prod.js')
  console.log('Watchers terminated')
  process.exit()
})