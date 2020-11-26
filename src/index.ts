import ValClient from './ValClient';

// failsafe
if (!process.env.MODE) {
	process.env.MODE = 'DEVELOPMENT';
}

console.log(`[info] starting in ${process.env.MODE} mode`);

const client: ValClient = new ValClient({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.init(process.env.AUTH_TOKEN);
client.on('error', (err: Error) => {
	console.log('An error occured with ValClient', err);
	process.exit(1);
});
