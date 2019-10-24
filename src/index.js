const Structures = require('./structures/')

module.exports = {
  // Command Structures
  ValClient: require('./ValClient'),
  Command: Structures.Command,
  CommandContext: Structures.CommandContext,
  Listener: Structures.Listener,
  Loader: Structures.Loader
}
