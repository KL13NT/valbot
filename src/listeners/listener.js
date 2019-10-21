const { CommandContext, EventListener, MiscUtils } = require('../')

export class BaseListener {
  constructor (client) {
    this.client = client
    this.events = []
  }
}