export default class Loader {
  constructor (client){
    this.client = client
  }

  initialise () {
    try {
      this.load()
      return true
    }
    catch (err) {
      //Log err
    }
  }
}