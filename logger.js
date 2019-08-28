const fs = require('fs')
const path = require('path')



export const createLogFile = async logData => {
  try{
    await fs.writeFile(path.resolve(__dirname, `./logs/${new Date()}`), logData)
  }
  catch(err){
    console.log(err)
  }
}