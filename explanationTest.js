const fs = require('fs'),
  path = require('path'),
  util = require('util')

fs.readFile('discordExplanation.md', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})