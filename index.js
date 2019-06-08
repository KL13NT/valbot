// const Discord = require('discord.js')
// const client = new Discord.Client()
// const DBL = require('dblapi.js')
// const dbl = new DBL('NTg2ODYxNDk2NTIxNDU3Njc0.XPuVAw.5nX0zDif84kNW55QaH4aha5vb90', client)
const express = require('express').app

const app = express()
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
  console.log('Listening!')
})

app.get('*', (req,res)=>{
  res.send('Hello!')
})
// dbl.on('error', e =>{
//   console.log(`Oops! ${e}`)
// })