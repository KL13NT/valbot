
/**
 * Base Listener
 * @param {ValClient} client The active ValClient instance
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


module.exports = class Listener{
  constructor (client, events = []) {
    this.client = client
    this.events = events

    this.init()
  }
  
  async init () {
    this.events.forEach(event => {
      this.client.on(event, this[`on${capitalise(event)}`])
    })
  }
}
  
const capitalise = (event) => `${event[0].toUpperCase()}${event.substr(1)}`