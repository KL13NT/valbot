# ValariumBot

A bot for the Valarium community discord server. Run `tsc` in the root project directory to compile it first.

## Table of Contents

- [Developer Notes](#Developer-Notes)
- [Motivation](#Motivation)
- [Lifecycle](#Lifecycle)
- [Prerequisites](#Prerequisites)
  - [Environment Variables](#Environment-Variables)
  - [Deployment Prerequisites](#Deployment)
  - [Development Prerequisites](#Development)
- [Behaviour](#Behaviour)
  - [Structure](#Structure)
- [Development Environment](#Development-Environment)
  - [Linting](#Linting)
  - [Testing](#Testing)
- [Contributing](#Contributing)
- [Contributors](#Contributors)
- [Backlog](#Backlog)

## Developer Notes

Hello there! Reading this means you're interested in the source code for this bot, and lucky you, it's actually completely _open source_.

I'm Nabil Tharwat, a Frontend Engineer based in Egypt. Feel free to contact me about anything and everything related to this codebase. If you want to request a feature, shoot me an issue on this repo or contact me on any platform. Wondering where to find me? Head to [iamnabil](https://iamnabil.netlify.app/about) and pick the platform you'd like. I'll let you read the documentation now. Have a lovely day!

## Motivation

Creating this bot was in the first place a primary necessity for the Valarium community, because we needed customisation. A lot of it. And we need low-level customisation that market bots can't deliver. So, me being a ninja-expert nodejs developer with no experience at all (lol?) I decided to challenge myself and craft this myself.

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

Constants are loaded using [motdotla's `dotenv`](https://github.com/motdotla/dotenv). `dotenv` doesn't override variables, so if you have production environment variables set on your cloud hosting solution, those will be used instead of the ones in `.env`, which you should either way.

Variables on the other hand are loaded from a collection called `config` in Mongo. This is dynamically set up using the `setup` command available to developers only.

> Never push your `.env` files to source control.

#### Example valid `.env`

Check out `sample-env` in this repo.

## Deployment

> **Note**: You need working _cloud_ MongoDB & Redis instances

> **Note**: This command is meant to start on your deployment server (i.e. Heroku)

Production server start command:

```bash
yarn start
```

## Development

> ~~**Note**: You need working _local_ MongoDB & Redis instances~~

# Behaviour

> This section describes how the bot operates.

## Structure

- Structures: The most basic building blocks
- Loaders: Responsible for loading controllers & commands onto `ValClient`
- Listeners
- Controllers
- Commands
- Media: Contains all images, text files, etc, that are needed but are not code
- Utils: Utility classes that help the general flow and developer experience.

> If you're running the production version of the bot, `valarium-bot` will become visibly online in the server.

> If you're running the development one instead, `valarium-bot-development` will be the one to be online.

# Development Environment

This section describes the linters used, testing frameworks, and their configuration.

## Linting

Please follow the linting rules in `.eslintrc.js` paired with Prettier. Both are configured.

## Testing

Testing has not yet been implmeneted, but shall be done using Jest.

## Contributing

I love contributing to OSS! And would love contributions to this repo. Checkout `CONTRIBUTING.md` in this repo for all info about this.

## Contributors

- [KL13NT](https://github.com/KL13NT) Owner

# Backlog

For the upcoming features that I'm thinking of adding or am planning to add, known bugs, or things needing work in general go to the [trello page](https://trello.com/c/YYLfZ7Gi/) for this project.
