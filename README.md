<center>

<p align="center">

<img align="center" height="100px" alt="icon" src="https://raw.githubusercontent.com/KL13NT/valbot/master/botlogo.png?token=AE6X4CTXHGDBJUH5CANYZ6C6L4TLC">

# ValariumBot

A bot for the Valarium community discord server.

</p>

</center>


## Table of Contents
- [Developer Notes](#Developer-Notes)
- [Motivation](#Motivation)
- [Contributing](#Contributing)
- [Lifecycle](#Lifecycle)
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
- [Where this project is headed](#Where-this-project-is-headed)

## Developer Notes
Hello there! Reading this means you're interested in the source code for this bot, and lucky you, it's actually completely *open source*.

I'm Nabil Tharwat, a UXE based in Egypt. Feel free to contact me about anything and everything related to this codebase. If you want to request a feature, shoot me an issue on this repo or contact me on any platform. Wondering where to find me? Head to [iamnabil](https://iamnabil.me/about) and pick the platform you'd like. I'll let you read the documentation now. Have a lovely day!


## Motivation
Creating this bot was in the first place a primary goal for the Valarium community, because we needed customisation. A lot of it. And we need low-level customisation that market bots can't deliver. So, me being a ninja-expert nodejs developer with no experience at all, lol, I decided to challenge myself and craft this myself.

## Contributing
I love contributing to OSS! And would love contributions to this repo. If you have a feature request, bug report, or have coded a new feature you can open an issue/PR/contact me anywhere and tell me all about it. If you have suggestions regarding cleaning up this codebase also feel free to tell me. I'd love to hear others' opinions on this.

## Lifecycle
Commits follow a schema that's defined as `[<type>] <commit_message>`, where `<type>` is one of:
- `Bug`: Bug fixes and commits related to them
- `Feature`: Feature updates and incremental additions
- `Docs`: Documentation updates
- `Config`: Configuration changes
- `Amend`: Fixing older commits and/or rebasing them
- `Refactor`: Adding tests and refactoring code

All commits are on `develop` branch by default and new releases are then PR'ed into `master` which in turn starts the CI stages:
- `lint`
- `test`
- if both previous passed, `build`
- if `build` passed, generate new `docs`
- deploy to gh-pages branch

> You're well advised to make sure tests and linting pass on your machine locally before pushing.


# Prerequisites
- Appropriate env variables, see [#Environment Variables](#Environment-Variables)
- Invite the production bot `valarium-bot` to the server in which it'll be used in production
- Invite the development version `valarium-bot-development` to test exclusive and new features

## Environment Variables
Environment Variables are loaded using [motdotla's `dotenv`](https://github.com/motdotla/dotenv). `.env` files are saved in their respective folders inside `env/`. `dotenv` doesn't override variables, so if you have production environment variables set on your cloud hosting solution, those will be used instead of the ones in the folders.

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
> ~~**Note**: You need a working *local* MongoDB instance~~

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

# Where this project is headed
I'm a lone wolf, working on and maintaining this project alone. If you have any questions contact me on Twitter [@Nabil_Tharwat16](https://twitter.com/Nabil_Tharwat16). As for the project, I'm willing to keep maintaining it and improving it as long as [Valarium](https://discord.gg/xrGAnTg) lives, who knows how long that could be.

As for the upcoming features that I'm thinking of adding or am planning to add, you can look at the [Roadmap](./Roadmap.md) file.