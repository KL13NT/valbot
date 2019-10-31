# valbot
A bot for our Valarium Discord server

# Contents
- [Prerequisites](#Prerequisites)
  - [Environment Variables](#Environment-Variables)
  - [Deployment Prerequisites](#Deployment)
  - [Development Prerequisites](#Development)
- [Behaviour](#Behaviour)
  - [Structure](#Structure)
  - [How it all comes together](#How-it-all-comes-together)
- [Development Environment](#Development-Environment)
  - [Linting](#Linting)
  - [Testing](#Testing)
- [Contributing](#Contributing)
- [Contributors](#Contributors)
  - [Code Contributors](#Code-Contributors)
  - [Helpers](#Helpers)
  - [Discussions Creator](#Discussions-Creator)

# Prerequisites
- Appropriate env variables, see [#Environment Variables](#Environment-Variables)
- Invite the production bot `valarium-bot` to the server in which it'll be used in production
- Invite the development version `valarium-bot-development` to test exclusive and new features

## Environment Variables
Environment Variables are loaded using [motdotla's `dotenv`](https://github.com/motdotla/dotenv). To change deployment mode place an appropriate `.env` file in the base directory before running any tasks. 

#### Example valid `.env`
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

## Deployment
> **Note**: You need a working *cloud* MongoDB instance

> **Note**: This command is meant to start on your deployment server (i.e. Heroku)

Production server start command: 
```bash
yarn start
```

## Development
> **Note**: You need a working *local* MongoDB instance

Development server start command:

```bash
yarn develop
```


# Behaviour
> This section describes how the bot operates.

## Structure
```
/index.js
  Has one responsibility, which is to start the bot server. Initialises Database and ValClient objects.

/src
  /ValClient
    The bot instance, reponsible for emitting events and sharing server data. Has methods to initialise listeners and loaders
  
  /Structures
    How each class should look and function. Considered blueprints for new code
  
  /Listeners
    Event listeners that are attached to ValClient upon initialisation. Once an instance of a Listener is created, it invokes the init method which initialises the listener
  
  /Loaders
    These are supposed to load files and other utilities such as commands
  
  /Database
    Is responsible for connecting to the MongoDB instance if available and has _db as the used database instead of grabbing it every time we need it
  
  /Commands
    Self-explanatory. 
  
  /Utils
    Contains utilities. This is to be moved into /Packages soon.

/Packages
  Extra packages created to aid the development/running of the bot such as loggers.

/Logs
  Self-explanatory

/env
  Contains two folders, each one of them corresponding to a specific version of .env file. Development variables, and production ones. 

/text
  Contains files that are pure text and are needed when the bot is working(i.e. How to use discord for new users, or the logo in text to be displayed in the terminal).
```

> If you're running the production version of the bot, `valarium-bot` will become visibly online in the server. 

> If you're running the development one instead, `valarium-bot-development` will be the one to be online.

## How it all comes together
- index.js initialises a Database instance and a ValClient instance, invoking `init` in the process.
- ValClient invokes `login`
- ValClient invokes `initLoaders`
- initLoaders goes through `/loaders/index.js` and initialises every loader in that file, before invoking `load` to start them.
- ValClient invokes `initListeners`
- initListeners works like `initLoaders`, except it doesn't invoke a `load` method, but rather each listener invokes `init` once initialised.
- Listener `init` attaches each listener to the respective event on ValClient. See [Listener.init:25](./src/Structures/Listener.js#L25). Now when a listened-to event happens, the respective listener will handle it.
- If the `onMessage` event is emitted, some checks happen on it to make sure whether it's a command. If it's a command, the respective command is invoked as `commandName.init()` which in turn calls `commandName.run` if the passed `context` is appropriate and everything goes well. 
- Commands are loaded by reading all file names in `/src/commands`, formatting them, and then initialising each exported command-class until one is needed.
- `MessageListener` handles command interpretation from messages and calls the respective command. 

# Development Environment
This section describes the linters used, testing frameworks, and their configuration. 

## Linting
Please follow the linting rules in `.eslintrc.js` and use only that. Prettier has some weird rules that hinder productivity instead of boost it. ESLint is the only formatter used in this repo.

## Testing
Testing has not yet been implmeneted, but shall be done using Jest.

# Contributing
Any contribution aimed at improving performance/ease of use is of high priority. 

Types of issues to use: 
- Performance
- Accessibility
- Readability
- Documentation
- Feature Request
- Open Discussion
- Other


The steps I go about this process is: 

1. Open an issue with the title schema `[Type_of_issue_here] Issue brief description`, replacing `Type_of_issue_here` with a corresponding issue type from the list above, and the `Issue brief description` with an actual description.

2. If the issue is accepted and you want to modify/add the code yourself, open a PR. else, it'll be left open until someone is assigned or a PR is made.

3. If you're opening a PR, make sure every commit you make is signed. See this to learn more about commit signing: [Developer Certificate of Origin](https://github.com/probot/dco#how-it-works). 

> Every contribution you make adds you to the [Contributors List](#Contributors), unless you're asking for help understanding something in the codebase.

I appreciate every single person who tries -- in any way -- to help the development of this codebase, that's why I decided to add people who open positive discussions, help others learn how to operate this bot or how to contribute to it, or are contributors who shared some bits of code or even total reworks of code. 

There are three main classes of contributions: 
- Discussions Creator
- Helper
- Code Contributor


# Contributors
This section lists all contributors to this project. 

## Code Contributors
[KL13NT](https://github.com/KL13NT)

## Helpers
Want to appear on this list? See [Contributing](#Contributing).

## Discussions Creator
Want to appear on this list? See [Contributing](#Contributing).