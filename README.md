# valbot
A bot for our Valarium Discord server

# Deployment Prerequisites
- Invite the production bot `valarium-bot` to the server in which it'll be used in production
- Invite the development version `valarium-bot-development` to test exclusive and new features
- Appropriate env variables, see [#Environment Variables](#Environment-Variables)

# Behaviour
- If you're running the production version of the bot, `valarium-bot` will become visibly online in the server. 
- If you're running the development one instead, `valarium-bot-development` will be the one to be online.

# Development
To run this bot in development mode use the following: 

```bash
yarn start:develop
```
Which in turn runs two commands in parallel using `run-p` -- part of the `npm-run-all` package --, `webpack` and `develop:server`:

```bash
run-p webpack develop:server
```

By running these two commands two things happen:
1. Webpack builds and watches the code base
2. `nodemon` starts the `index.prod.js` file, starting the bot server in turn. 

# Production
To run this bot in production mode use the following: 

```bash
yarn start:develop
```
Which in turn runs two commands in parallel using `run-p` -- part of the `npm-run-all` package --, `webpack` and `develop:server`:

```bash
run-p webpack develop:server
```

By running these two commands two things happen:
1. Webpack builds and watches the code base
2. `nodemon` starts the `index.prod.js` file, starting the bot server in turn. 

# Environment Variables
Environment Variables are loaded using [motdotla's `dotenv`](https://github.com/motdotla/dotenv). To change deployment mode place an appropriate `.env` file in the base directory before running any tasks. 

## Example valid `.env`
These keys are required for proper functionality, if any of the ones preceded with `*` isn't present or properly set the bot will fail to start, mostly.
```env
*CLIENT_ID

CLIENT_SECRET

*AUTH_TOKEN

*PERMISSIONS_INTEGER=8

*DB_HOST

*DB_NAME

MODE=DEVELOPMENT || PRODUCTION
```