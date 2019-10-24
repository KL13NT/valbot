export default class Loader {
  constructor (client){
    this.client = client
  }

  init () {
    try {
      this.load()
      return true
    }
    catch (err) {
      //Log err
    }
  }

  load (){}
}