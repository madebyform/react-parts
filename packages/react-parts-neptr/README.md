[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

### Setting up the _Never Ending Pie-Throwing Robot_ with the Slack adapter

This hubot makes it easier to review new components and run other maintenance tasks.

![N.E.P.T.R.](./screenshots/neptr.gif)

Start configuring your Slack integration by going to: `https://<your-team>.slack.com/services/new/hubot`  
Also, go to GitHub and generate a [Personal Access Token](https://github.com/settings/tokens) with the `repo` and `gist` scopes.


In your client machine, deploy the bot to the server:

```
git remote add dokku-neptr dokku@react.parts:react-parts-neptr
git subtree push --prefix packages/react-parts-neptr dokku-neptr master
```

Connect to the server and clone the main repo:

```
mkdir /var/www/react-parts-repo
cd /var/www/react-parts-repo
git clone https://<your-github-username>:<your-github-token>@github.com/madebyform/react-parts.git .
git remote add github-bot https://<your-github-username>:<your-github-token>@github.com/madebyform/react-parts.git
```

Configure the app for hubot:

```
dokku config:set react-parts-neptr HUBOT_SLACK_TOKEN=<slack-token>
dokku config:set react-parts-neptr HEROKU_URL=<app-url>
dokku config:set react-parts-neptr NEPTR_GIST_TOKEN=<your-github-token>
dokku config:set react-parts-neptr NEPTR_GIST_ID=<gist-for-storing-tweets>
dokku config:set react-parts-neptr TWITTER_CONSUMER_KEY=<twitter-consumer-key>
dokku config:set react-parts-neptr TWITTER_CONSUMER_SECRET=<twitter-consumer-secret>
dokku config:set react-parts-neptr TWITTER_ACCESS_TOKEN=<twitter-access-token>
dokku config:set react-parts-neptr TWITTER_ACCESS_TOKEN_SECRET=<twitter-access-token-secret>
dokku config:set react-parts-neptr DOKKU_WAIT_TO_RETIRE=0
```

And make the git repo and data folder accessible to it:

```
dokku docker-options:add react-parts-neptr deploy "-v /var/www/react-parts-repo:/app/repo"
dokku docker-options:add react-parts-neptr run "-v /var/www/react-parts-repo:/app/repo"
dokku docker-options:add react-parts-neptr deploy "-v /var/www/react-parts-data:/app/data"
dokku docker-options:add react-parts-neptr run "-v /var/www/react-parts-data:/app/data"
```

Done! From now on, if you ever need to force push:

```
git push dokku-neptr `git subtree split --prefix packages/react-parts-neptr <your-branch>`:master --force
```

And every time you need to update the main repo:

```
ssh -t react.parts 'cd /var/www/react-parts-repo && git pull'
```

More information available at [hubot](https://hubot.github.com) and [hubot-slack](https://github.com/slackhq/hubot-slack).

---

_Feedback, bug reports and other contributions are always welcomed! [React.parts](https://react.parts) :blue_heart: you._
