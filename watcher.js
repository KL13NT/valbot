var process = require('process')
var cp = require('child_process')
var fs = require('fs')

var server = cp.fork('index.js')
console.log('Server started')

fs.watchFile('index.js', function (event, filename) {
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