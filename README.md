# ValBot

This is a [Discord.JS](https://discord.js.org) bot built for the [Valarium Discord Server](https://valarium.netlify.app/) with NodeJS, TypeScript, Redis, and MongoDB.

> We're currently in the process of re-structuring the bot into modules so we
> can release it completely open to the world on npm. Your contributions to the
> bot in its current state will be preserved and appreciated nonetheless and
> will contribute to the future of the bot. Thanks!

## Motivation

Creating this bot was in the first place a primary necessity for the Valarium community because we needed customisation. A lot of it. And we need low-level customisation that market bots can't deliver. So, me being a ninja-expert nodejs developer with no experience at all (lol?) I decided to challenge myself and craft this myself.

## ✋ Wish to Contribute?

You're more than encouraged (and welcomed) to contribute!

```
🤔 Suggest a feature
🐛 Report an issue
📖 Improve documentation
👩‍💻 Contribute to the code
```

Before contributing, kindly check the [contribution
guidelines](./CONTRIBUTING.md). Please adhere to this project's [code of
conduct](./CODE_OF_CONDUCT.md).

## Features

- Toxicity filtering using the TensorFlow [Toxicity
  Model](https://github.com/tensorflow/tfjs-models/tree/master/toxicity)
- Custom configuration using a `setup` command! Nothing is hardcored.
- Role-based commands!
- Management commands such as `clear`, `mute`, `rolegive`, and `ban`!
- Custom presence (bot user status) using commands instead of modifying code!
- Milestones and experience levels with supplementary commands such as `rank`
  and `leaderboard`!
- Reminders! `remindme` and `reminders`
- Music playing from YouTube (available) and Spotify (coming soon)!
- And best of all, open source!

## Feedback

If you have any feedback, please reach out to us on our [GitHub Discussions](https://github.com/KL13NT/valbot/discussions) page!

## Getting Started

Getting started is easy\*. You just need to setup a few things.

First things first, head over to [Discord Developer
Application](https://discord.com/developers/applications) and register two bots.
One of them will be used for the actual thing that will work 24/7 in the cloud,
and another for development and testing. Your `.env` configuration will
determine which to use. More details below.

You'll then need to invite the bot applications you created on the Discord
Developer Application page to your server.

You can use a single bot for both purposes, but that can be quite destructive
and unsafe, so it's generally recommended _against_.

You can either
get started on the cloud and not install anything but the npm dependencies, or
you can go completely local and install a bunch of other stuff.

A local installation is faster for responses and to avoid rate limits to other
services (other than Discord server) but has the downside of needing to have a
MongoDB server instance, a Redis server, and the bot's server running.

A cloud-based installation will require you configure a cloud redis host and a
mongo instance. I recommend [MongoDB Cloud](https://cloud.mongodb.com/) and
[Redis](https://redis.com/try-free/). They both have free plans and are _really_
beginner-friendly.

You'll need a [YouTube API
key](https://developers.google.com/youtube/v3/getting-started) either way if you
want music commands.

I recommend [Yarn](https://yarnpkg.com/) as the dependency manager and use it.
After this, just fork-and-clone/clone the repo and install the dependencies,
then run with the respective run command.

```bash
yarn install # to install dependencies

yarn dev:cloud # if you chose to use a cloud-based installation
# or
yarn develop # if you chose to use a local installation
```

## Environment Variables

To run this project, you will need to add the following environment variables to
your .env file or your deployment environment

```bash
CLIENT_ID= # client ID (Discord Apps Page)
CLIENT_SECRET= # client secret (Discord Apps Page)
AUTH_TOKEN= # authentication token (Discord Apps Page)
PERMISSIONS_INTEGER= # permissions integer (Discord Apps Page)
DB_HOST= # mongodb host string
DB_NAME= # mongodb database name
GUILD_ID= # the ID of your discord server (the server the bot will manage)
ROLE_DEVELOPER= # the developer role in your server, these have the ability to call dev commands
MODE= # DEVELOPMENT or PRODUCTION
REDIS_URL= # remote redis server if you have one, or you can use the Heroku Redis pack (not needed if you're using the heroku pack and local installation)
YOUTUBE_KEY= # YouTube API Auth Key for music playing
```

## Deployment

The bot is currently deployed on Heroku and uses its CI/CD to deploy on every
push to `master`. This is the simplest stack you get away with for something
like this that I know of.

## License

This projects is licensed under the GNU GPLv3 License. License information can be found in `COPYING` in the root of this repo.

## Roadmap

Check the project on [GitHub Projects](https://github.com/KL13NT/valbot/projects/1?fullscreen=true).

## Developer Notes

Hello there! Reading this means you're interested in the source code for this bot, and lucky you, it's actually completely _open source_.

I'm Nabil Tharwat, a Frontend Engineer based in Egypt. Feel free to contact me about anything and everything related to this codebase. If you want to request a feature, shoot me an issue on this repo or contact me on any platform. Wondering where to find me? Head to [iamnabil](https://iamnabil.netlify.app/) and pick the platform you'd like. I'll let you read the documentation now. Have a lovely day!

## Lifecycle

I use the [GitHub flow](https://guides.github.com/introduction/flow/). All work
is done on feature/fix branches and are merged into `master`, which in turn
starts the Heroku CI:

- `lint`
- `test`
- `build`
- `deploy`

> You're well advised to make sure tests and linting pass on your machine
> locally before pushing, to avoid style change requests.

## Environment Variables

Environment variables are loaded using [motdotla's `dotenv`](https://github.com/motdotla/dotenv). `dotenv` doesn't override variables, so if you have production environment variables set on your cloud hosting solution, those will be used instead of the ones in `.env`, which you should either way.

Configuration variables on the other hand are loaded from a collection called
`config` in Mongo. This is dynamically set up using the `setup` command
available to developers (users with ROLE_DEVELOPER assigned) only.

> Never push your `.env` files to source control.

## Running in Production

Production server start command:

```bash
yarn start
```

> That's all :)

## Folder Structure

```
valbot
├── __mocks__
├── __tests__
├── .fonts
├── docs
├── media
└── src
  ├── commands
  ├── config
  ├── controllers
  ├── listeners
  ├── structures
  ├── types
  ├── utils
  ├── index.ts
  ├── messages.json
  └── ValClient.ts
```

## Project Structure Rundown

- `/__mocks__` is where jest mocks live.
- `/__tests__` contains configuration for tests.
- `/.fonts` contains fonts used for `rank` command card.
- `/docs` contains generated documentation (obsolete).
- `/media` contains static files used across the bot. You usually won't need to modify it but for the markdown pages inside. For more details you can read the Docusaurus docs.
- `/src` source code!
- `/src/commands` contains all commands.
- `/src/config` contains some json files for messages and responses.
- `/src/controllers` contains core logic.
- `/src/listeners` for event handlers.
- `/src/loaders` contains modules that load all other modules.
- `/src/structures` contains core structures that are extended elsewhere.
- `/src/types` typescript types.
- `/src/utils` utility and helper functions.

You'll generally need to modify `/src/controllers` and `/src/commands` when
contributing.

## Core Structures

Structures are the most basic building blocks of the bot. They're extended
everywhere to implement repetitive logic.

- `Controller`: for building core supporting logic for commands and listeners
- `Command` and `CommandContext`: used when building commands
- `Listener`: for attaching event listeners on the discord.js client
- `Loader`: for loading anythin on `ValClient`
- `PaginatedEmbed`: for multi-page embeds that use reactions to change pages

## Code Style

Please follow the linting rules in `.eslintrc.js` paired with Prettier. Both are configured.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/Amrsamy19"><img src="https://avatars.githubusercontent.com/u/46032085?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Amrsamy19</b></sub></a><br /><a href="https://github.com/KL13NT/valbot/commits?author=Amrsamy19" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/omarabdelaz1z"><img src="https://avatars.githubusercontent.com/u/59033999?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Omar Abdelaziz</b></sub></a><br /><a href="https://github.com/KL13NT/valbot/commits?author=omarabdelaz1z" title="Code">💻</a> <a href="#ideas-omarabdelaz1z" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-omarabdelaz1z" title="Maintenance">🚧</a> <a href="#question-omarabdelaz1z" title="Answering Questions">💬</a> <a href="https://github.com/KL13NT/valbot/issues?q=author%3Aomarabdelaz1z" title="Bug reports">🐛</a> <a href="https://github.com/KL13NT/valbot/pulls?q=is%3Apr+reviewed-by%3Aomarabdelaz1z" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!