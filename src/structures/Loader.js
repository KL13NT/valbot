
/**
  * Base Loader 
  * @param {ValClient} client The active ValClient instance 
  * @example EventLoader
  * class ListenersLoader extends Loader(){
  *   constructor(client){
  *     super(client)
  *   }
  *   load(){
  *     listeners.forEach(listener=>{
  *       let currentListenerInstance = new listener(clint)
  *       currentListenerInstance.events.forEach(event=>{
  *           client.on('event', currentListenerInstance.[`on${event[0].toUpperCase()}${event.substr(1)}`]
  *       })
  *     })
  *   }
  * }
  */

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

