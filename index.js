"use strict";
exports.__esModule = true;
var ValClient_1 = require("./src/ValClient");
var client = new ValClient_1.ValClient({
    fetchAllMembers: true,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
client.init(process.env.AUTH_TOKEN);
client.on('error', function (err) {
    console.log('An error occured with ValClient', err);
    process.exit(1);
});
