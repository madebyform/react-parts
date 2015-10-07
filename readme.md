[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

### Updating the catalog

We have several scripts defined in the `package.json` file that help us keep the catalog updated. Here are the main ones, usually ran in sequence:
- `npm run update` downloads new packages from NPM, stores them into `data/npm.json`, parses that and updates the `components/react-*.json` files;
- `npm run fetch:all` goes through all components in the `components/react-*.json` files and gets updated metadata (stars, etc.) from NPM & GitHub and stores that into `data/react-*.json`;
- `npm run publish` uploads the `data/react-*.json` files to the server and pushes the updated `components/react-*.json` files to GitHub.

Some observations:
- This means `fetch:all` can run in a cron job if we want it too;
- `update` is called once per day and its output is manually reviewed because there are packages published to NPM that have not been open sourced on GitHub, don't have a readme yet or are forks meant to be merged upstream in the near future (just to mention some of the most common cases), and so we don't include them right away. Also, when authors don't set a description for their packages, NPM generates one by using the readme, but it isn't always good, so sometimes we end up writing one ourselves;
- The `components/react-*.json` files are pushed to GitHub just to make sure these manually curated lists are also easily available to anyone and can be reused by other projects. You may argue that having auto-generated commits pushed into master is not a great idea, but it's simple.

To retrieve information from GitHub you will need to create a `keys.json` file (see `keys.json.example`). You can use your credentials but we recommend you generate a [Personal Access Token](https://github.com/settings/tokens) instead. Under "Select scopes", simply check "public_repo". You can then use that token as the value for the `username` key and leave `password` empty.

### Deploying new features

React.parts is a regular database-less Node.js app, so you can host it however you like. We use Dokku, so deploying new features is as easy as:

```
git push dokku master
```

For updating the catalog, we simply call `npm run publish` which, among other things, uploads the static files via `scp`.


### Setting up a production environment

As mentioned before we use Dokku, so to setup a similar environment you need to:

```
git remote add dokku dokku@react.parts:react-parts
git push dokku master
```

Since the `data/react-*.json` files are not in our git repository (only `components/react-*.json` are) we need to use Dokku's persistence storage:

```
mkdir -p /var/www/react-parts/data
dokku docker-options:add react-parts "-v /var/www/react-parts/data:/app/data"
```

---

_Feedback, bug reports and other contributions are always welcomed! [React.parts](https://react.parts) :blue_heart: you._
