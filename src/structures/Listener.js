module.exports = class Listener{
  constructor (client, events = []) {
    this.client = client
    this.events = events
  }
  
  async init () {
    this.events.forEach(event => {
      this[`on${event[0].toUpperCase()}${event.substr(1)}`]()
    })
  }
}

/**
 * @example
 * class ChildListener extends Listener{
 *  constructor(client, events){
 *    super(client, events)
 *  }
 *  onMessage(){
 *    //do something
 *  }
 * }
 */

/**
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