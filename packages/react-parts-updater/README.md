[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

### Updating the catalog

We have several scripts defined in the `package.json` file that help us keep the catalog updated. Here are the main ones, usually ran in sequence:
- `npm run pull` downloads new packages from NPM, stores them into `data/npm.json`, parses that and updates the `components/react-*.json` files;
- `npm run update` goes through all components in the `components/react-*.json` files and gets updated metadata (stars, etc.) from NPM & GitHub and stores that into `data/react-*.json`;
- `npm run publish` pushes the `data/react-*.json` files to the search server and pushes the updated `components/react-*.json` files to GitHub.

Some observations:
- This means `update` can run in a cron job if we want it too;
- `pull` is called once per day and its output is manually reviewed because there are packages published to NPM that have not been open sourced on GitHub, don't have a readme yet or are forks meant to be merged upstream in the near future (just to mention some of the most common cases), and so we don't include them right away. Also, when authors don't set a description for their packages, NPM generates one by using the readme, but it isn't always good, so sometimes we end up writing one ourselves;
- The `components/react-*.json` files are pushed to GitHub just to make sure these manually curated lists are also easily available to anyone and can be reused by other projects. You may argue that having auto-generated commits pushed into master is not a great idea, but it's simple.

To retrieve information from GitHub you will need to create a `keys.json` file (see `keys.json.example`). You can use your credentials but we recommend you generate a [Personal Access Token](https://github.com/settings/tokens) instead. Under "Select scopes", simply check "public_repo". You can then use that token as the value for the `username` key and leave `password` empty.

### Initial setup

The `publish` script commits the new `components/react-*.json` files to GitHub. You should setup the right `remote`:

```
git remote add github-bot git@github.com:madebyform/react-parts.git
```

If you don't want the commits to be created with your personal GitHub account, generate a [Personal Access Token](https://github.com/settings/tokens) with the `repo` scope and use it like this:

```
git remote add github-bot https://<your-username>:<your-token>@github.com/madebyform/react-parts.git
```

---

_Feedback, bug reports and other contributions are always welcomed! [React.parts](https://react.parts) :blue_heart: you._
