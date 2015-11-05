[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

### Deploying new features

React.parts is a regular database-less Node.js app, so you can host it however you like. We use Dokku, so deploying new features is as easy as:

```
git push dokku master
```

For updating the catalog, we simply call `npm run publish` which, among other things, updates the search index.


### Setting up a production environment

As mentioned before we use Dokku, so to setup a similar environment you need to:

```
git remote add dokku dokku@react.parts:react-parts
git subtree push --prefix packages/react-parts-web dokku master
ssh -t react.parts 'dokku config:set react-parts NODE_ENV=production'
```

Since the `data/docs.json` file is not in our git repository, we need to use Dokku's persistence storage:

```
mkdir /var/www/react-parts-data
dokku docker-options:add react-parts deploy "-v /var/www/react-parts-data:/app/data"
dokku docker-options:add react-parts run "-v /var/www/react-parts-data:/app/data"
```

---

_Feedback, bug reports and other contributions are always welcomed! [React.parts](https://react.parts) :blue_heart: you._
