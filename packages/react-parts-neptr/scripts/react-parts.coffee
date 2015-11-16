# Description:
#   Commands that make it easier to review new components and run other maintenance tasks.
#
# Commands:
#   0. hello - Used for diagnostic purposes.
#   0. help - Displays help about the commands that Neptr knows about.
#   1. pull - Downloads from npm components published since yesterday and starts the review process.
#   1. pull <date> - Downloads from npm components published since a given date and starts the review process.
#   1. parse <date> - Similar to pull, but uses the data in `data/npm.json` instead of downloading.
#   1. <yes|no> - After pull or parse, new components are presented, one at a time. You can accept or discard them.
#   2. edit <prop>:<value> - After pull or parse, new components are presented, one at a time. You can edit their repo or description.
#   2. update - Updates the metadata and docs for each component in the catalog.
#   2. diff - Displays the changes that were made to the catalog files.
#   2. publish - Makes docs available to the website, updates the search index and commits the updated catalog to GitHub.
#   3. catalog edit <name> <prop>:<value> - Edit a property of any component already in the catalog.
#   3. catalog remove <name> - Remove any any component already in the catalog.
#   3. catalog reject <name> <repo> - Add a component to the list of rejected components.
#   3. catalog add <type> <name> repo:<repo> description:<description> - Manually add a new component to the catalog.
#   3. tweet - Start tweeting about recently added components every hour on the hour.
#
# Notes:
#   These commands are all defined using `hear` instead of `respond` to avoid having to
#   write the hubot's name all the time. You should use this bot in a dedicated room.

fs = require('fs')
path = require('path')
url = require('url')
exec = require('child_process').exec
_ = require('lodash')
webshot = require('webshot')
schedule = require('node-schedule')
Twit = require('twit')

# Paths to the catalog files
catalogPath = path.resolve(__dirname, "../repo/packages/react-parts-catalog/")
webComponentsFilename = path.resolve(catalogPath, "./components/react-web.json")
nativeComponentsFilename = path.resolve(catalogPath, "./components/react-native.json")
rejectedComponentsFilename = path.resolve(catalogPath, "./components/rejected.json")
webDataFilename = path.resolve(catalogPath, "./data/react-web.json")
nativeDataFilename = path.resolve(catalogPath, "./data/react-native.json")
docsFilename = path.resolve(catalogPath, "./data/docs.json")

# Import the catalog scripts
catalogParse = require path.resolve(catalogPath, "./parse")
catalogFetch = require path.resolve(catalogPath, "./fetch")
catalogIndex = require path.resolve(catalogPath, "./reindex")

# Configs
appUrl = process.env.HEROKU_URL || "http://localhost/"
room = process.env.NEPTR_ROOM || "scripts" # Room to where neptr should send messages
screenshots =
  path: "/screenshots"
  url: url.resolve(appUrl, "screenshots")
  filepath: path.resolve("./screenshots")
  options:
    customCSS: ".markdown-body { max-height:1000px; overflow:hidden } \
      .file-wrap { max-height:298px; overflow:hidden } \
      .header, .site-footer, .boxed-group > h3, .file-navigation, .repository-meta { display:none }"
    screenSize:
      width: 1100
    shotSize:
      height: "all"
gist =
  token: process.env.NEPTR_GIST_TOKEN
  id: process.env.NEPTR_GIST_ID
twitter = new Twit
  consumer_key: process.env.TWITTER_CONSUMER_KEY
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET
  access_token: process.env.TWITTER_ACCESS_TOKEN
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET


module.exports = (robot) ->
  # Used for diagnostic purposes
  robot.hear /^hello$/i, (res) ->
    greet res, 0

  # Displays help about the commands that Neptr knows about
  robot.hear /^help$/i, (res) ->
    res.send "Check out my mods, bro:"
    res.send help().join("\n")

  # Downloads from npm components published since a given date and parses them.
  # You can interactively review them. The ones that are accepted are added to
  # the `components/react-*.json` files and new tweets are added to the queue.
  robot.hear /^pull (.*)$/i, (res) ->
    reset()
    greet res
    pull res, res.match[1]

  # Downloads and parses new components published in the previous day
  robot.hear /^pull$/i, (res) ->
    reset()
    greet res
    pull res, "yesterday"

  # Similar to pull, but uses the data in `data/npm.json` instead of downloading
  robot.hear /^parse (.*)$/i, (res) ->
    reset()
    greet res
    parse res, res.match[1]

  # After pull or parse, new components are presented, one at a time.
  # Type "yes" to add it to the catalog.
  robot.hear /^y(?:es)?$/i, (res) ->
    acceptPendingComponent() if robot.brain.get("context") == "review"

  # After pull or parse, new components are presented, one at a time.
  # Type "no" to discard it.
  robot.hear /^n(?:o)?$/i, (res) ->
    discardPendingComponent() if robot.brain.get("context") == "review"

  # After pull or parse, new components are presented, one at a time.
  # Type "edit repo:new/repo" if the repo property is invalid.
  # Type "edit description:New Description." if the description property is invalid.
  robot.hear /^e(?:dit)? (.+):(.+)$/i, (res) ->
    return unless robot.brain.get("context") == "review"
    prop = res.match[1]
    val = res.match[2]
    editPendingComponent(prop, val)

  # Updates the metadata and docs for each component in the catalog
  robot.hear /^update$/i, (res) ->
    updateMetadata(res)

  # Displays the changes that were made to the catalog files. Uses `git status`.
  robot.hear /^diff$/i, (res) ->
    diffComponents res

  # Makes the docs available to the website, updates the search index
  # and commits the updated catalog to GitHub.
  robot.hear /^publish$/i, (res) ->
    publish res

  # Edit a property of any component already in the catalog
  robot.hear /^catalog e(?:dit)? (.+) (.+):(.+)$/i, (res) ->
    componentName = res.match[1]
    prop = res.match[2]
    val = res.match[3]
    editComponent(componentName, prop, val)

  # Remove any component already in the catalog
  robot.hear /^catalog r(?:emove)? (.*)$/i, (res) ->
    componentName = res.match[1]
    removeComponent(componentName)

  # Add a component to the list of rejected components
  robot.hear /^catalog reject (.*) (.*)$/i, (res) ->
    name = res.match[1]
    repo = res.match[2]
    rejectComponent(name, repo)

  # Manually add a new component to the catalog
  robot.hear /^catalog a(?:dd)? (.+) (.+) repo:(.*) description:(.*)$/i, (res) ->
    type = res.match[1]
    name = res.match[2]
    repo = res.match[3]
    desc = res.match[4]
    addComponent(type, name, repo, desc)

  # Start tweeting about recently added components every hour on the hour
  schedule.cancelJob "tweet"
  schedule.scheduleJob "tweet", minute: 0, ->
    tweetComponent()

  robot.catchAll (res) ->
    if res.message.text
      res.send "Can't understand what you mean, creator. Why, creator? Does it please you to watch me struggle?"


  # Available routes

  # Serve the screenshots that were taken to the component's github pages
  robot.router.get url.resolve(screenshots.path, ":componentName"), (req, res) ->
    res.sendfile path.join(screenshots.filepath, req.params.componentName)

  # Custom root page used for uptime monitoring
  robot.router.get "/", (req, res) ->
    res.send "Hello, friend!"


  # Under the hood: Neptr specific

  # Currently used to reset the "review" process, initiated by `parse` or `pull`
  reset = ->
    robot.brain.remove("context")
    robot.brain.set("pendingComponents", { web: [], native: [] })
    robot.brain.set("acceptedComponents", { web: [], native: [] })

  # Greet creator if time since last greeting is bigger than a given interval
  greet = (res, interval = 60 * 60 * 1000) ->
    if Date.now() - robot.brain.get("greetings") > interval
      res.reply "Greetings, creator! Neptr is fully functional!"
      robot.brain.set("greetings", Date.now())

  # Return a list of available commands
  help = ->
    robotName = robot.alias or robot.name
    robot.helpCommands().map (command) -> command.replace /hubot/ig, robotName


  # Under the hood: PARSE

  # Downloads components published since a given date and parses them.
  # Then an interactive review process is started.
  # @param [String] arg "yesterday" or a parsable date string
  pull = (res, arg) ->
    _download res, arg, (json) ->
      _parse res, arg, json, (pendingComponents) ->
        _startReviewing res, pendingComponents

  # Similar to pull, but uses the data in `data/npm.json` instead of downloading
  parse = (res, arg) ->
    npmFile = path.resolve(catalogPath, "./data/npm.json")
    asyncReadJSON npmFile, (json) ->
      _parse res, arg, json, (pendingComponents) ->
        _startReviewing res, pendingComponents

  # @param [String] arg "yesterday" or a parsable date string
  _download = (res, arg, callback) ->
    if arg == "yesterday"
      endpoint = "https://registry.npmjs.org/-/all/static/yesterday.json"
      res.send "Downloading components published yesterday…"
    else
      endpoint = "https://registry.npmjs.org/-/all"
      res.send "Downloading all components…"

    robot.http(endpoint).get() (err, _, body) ->
      try
        json = JSON.parse(body)
      catch error
        return res.reply "#{ randomErrorMsg() }: #{ error }"
      callback json

  # @param [String] arg "yesterday" or a parsable date string
  _parse = (res, arg, json, callback) ->
    since = null
    if arg == "yesterday"
      res.send "Parsing new components published yesterday…"
    else
      since = new Date(arg) unless isNaN(new Date(arg).getTime())
      res.send "Parsing new components since #{ (since and arg) or "ever" }…"

    afterParse = (webCandidates, nativeCandidates) ->
      res.reply "Parsing complete!"
      callback { web: webCandidates, native: nativeCandidates }

    catalogParse(json, afterParse, since: since, webKeywords: ["react-component", "react"])

  _startReviewing = (res, pendingComponents) ->
    robot.brain.set("pendingComponents", pendingComponents)
    robot.brain.set("context", "review")
    _askReview()

  _askReview = ->
    pendingComponents = robot.brain.get("pendingComponents")
    if (pendingComponents.web.length)
      type = "web"
      component = pendingComponents.web[0]
    else if (pendingComponents.native.length)
      type = "native"
      component = pendingComponents.native[0]
    else
      return _finishReviewing()

    if component.repo then link = "https://github.com/#{ component.repo }"
    else link = "https://npmjs.com/package/#{ component.name }"

    fallback = "Reviewing #{ component.name } (#{ type } component): #{ link }"
    fallback += component.description

    if robot.adapterName != "slack"
      robot.messageRoom room, fallback
    else
      webshot link, path.join(screenshots.filepath, "#{ component.name }.png"), screenshots.options, (error) ->
        image_url = url.resolve(screenshots.url, "#{ component.name }.png")
        image_url = "" if error

        robot.emit "slack-attachment",
          channel: room
          content:
            fallback: fallback
            color: (if type == "native" then "#764FA5" else "good"),
            title: "New #{ type } component",
            image_url: image_url,
            fields: [{
              title: "Package name",
              value: component.name,
              short: true
            }, {
              title: "Repository",
              value: "<#{ link }|#{ component.repo || "unavailable" }>",
              short: true
            }, {
              title: "Description",
              value: component.description
            }]

  # Finishes the process of reviewing by saving the changes and generating tweets
  _finishReviewing = ->
    acceptedComponents = robot.brain.get("acceptedComponents")
    _addToFiles(acceptedComponents)
    robot.brain.remove("context")
    robot.messageRoom room, "New components saved successfully!"
    _saveTweets(acceptedComponents)

  # Accept a pending component
  acceptPendingComponent = ->
    pendingComponents = robot.brain.get("pendingComponents")
    acceptedComponents = robot.brain.get("acceptedComponents")
    if (pendingComponents.web.length)
      acceptedComponents.web.push(pendingComponents.web.shift())
    else
      acceptedComponents.native.push(pendingComponents.native.shift())
    _askReview()

  # Don't accept a pending component. It is not added to the rejected list.
  discardPendingComponent = ->
    pendingComponents = robot.brain.get("pendingComponents")
    if (pendingComponents.web.length)
      pendingComponents.web.shift()
    else
      pendingComponents.native.shift()
    _askReview()

  # Edit a component that is being reviewed
  editPendingComponent = (prop, val) ->
    pendingComponents = robot.brain.get("pendingComponents")
    if (pendingComponents.web.length)
      component = pendingComponents.web[0]
    else if (pendingComponents.native.length)
      component = pendingComponents.native[0]
    component = _editComponent(component, prop, val)
    robot.messageRoom room, "Component updated successfully!"


  # Under the hood: FETCH

  # Fetches new metadata for all web & native components and updates both
  # component & data files using react-parts-catalog's fetcher
  updateMetadata = (res) ->
    errors = []
    warnings = []
    batchSize = 50

    webComponents = readJSON(webComponentsFilename)
    nativeComponents = readJSON(nativeComponentsFilename)
    rejectedComponents = readJSON(rejectedComponentsFilename)
    webData = readJSON(webDataFilename)
    nativeData = readJSON(nativeDataFilename)
    docs = readJSON(docsFilename)

    numBatchesWeb = Math.ceil(webComponents.length / batchSize)
    numBatchesNative = Math.ceil(nativeComponents.length / batchSize)

    sendError = (error, i, total) ->
      return if errors.length > 25

      fallback = "Error for `#{ error.ref }`: #{ error.msg } (batch #{ i } of #{ total })"
      if robot.adapterName != "slack"
        res.send fallback
      else
        robot.emit "slack-attachment",
          channel: room
          content:
            fallback: fallback
            color: "danger",
            text: randomErrorMsg()
            fields: [{
              title: "Component name",
              value: error.ref,
              short: true
            }, {
              title: "Batch",
              value: "#{ i } of #{ total }",
              short: true
            }, {
              title: "Error message",
              value: error.msg
            }]

    sendWarn = (warning, i, total) ->
      return if warnings.length > 25

      fallback = "Warning for `#{ warning.ref }`: #{ warning.msg } (batch #{ i } of #{ total })"
      if robot.adapterName != "slack"
        res.send fallback
      else
        robot.emit "slack-attachment",
          channel: room
          content:
            fallback: fallback
            color: "warning",
            text: "A warning was triggered while fetching metadata"
            fields: [{
              title: "Component name",
              value: warning.ref,
              short: true
            }, {
              title: "Batch",
              value: "#{ i } of #{ total }",
              short: true
            }, {
              title: "Warning message",
              value: warning.msg
            }]

    res.send "Ooo! Fetching metadata… This will take a while. We're fetching… Fetching… Fetching!"

    _fetchWeb = (i, webComponents, webData, docs) ->
      if i < numBatchesWeb
        i += 1
        res.send "Fetching web batch #{ i } of #{ numBatchesWeb }…" if i % 5 == 0
        error = (ref, msg) -> sendError({ ref, msg }, i, numBatchesWeb)
        warn = (ref, msg) -> sendWarn({ ref, msg }, i, numBatchesWeb)
        catalogFetch "react-web", _fetchWeb, batchIndex: i, error: error, warn: warn, \
          components: webComponents, rejected: rejectedComponents, data: webData, docs: docs
      else
        fs.writeFile(webComponentsFilename, JSON.stringify(webComponents, null, '  '))
        fs.writeFile(webDataFilename, JSON.stringify(webData, null, '  '))
        fs.writeFile(docsFilename, JSON.stringify(docs, null, '  '))
        res.reply "I am finished fetching web components, master!"

    _fetchNative = (i, nativeComponents, nativeData, docs) ->
      if i < numBatchesNative
        i += 1
        res.send "Fetching native batch #{ i } of #{ numBatchesNative }…" if i % 5 == 0
        error = (ref, msg) -> sendError({ ref, msg }, i, numBatchesNative)
        warn = (ref, msg) -> sendWarn({ ref, msg }, i, numBatchesNative)
        catalogFetch "react-native", _fetchNative, batchIndex: i, error: error, warn: warn, \
          components: nativeComponents, rejected: rejectedComponents, data: nativeData, docs: docs
      else
        fs.writeFile(nativeComponentsFilename, JSON.stringify(nativeComponents, null, '  '))
        fs.writeFile(nativeDataFilename, JSON.stringify(nativeData, null, '  '))
        fs.writeFile(docsFilename, JSON.stringify(docs, null, '  '))
        res.send "Finished fetching native components, creator!"
        _fetchWeb(0, webComponents, webData, docs)
    _fetchNative(0, nativeComponents, nativeData, docs)

  # Print changes done to the components files in react-parts-catalog
  diffComponents = (res) ->
    _runCommand res, "git diff components/react-web.json", true, ->
      _runCommand res, "git diff components/react-native.json"

  # Run a command inside the react-parts-catalog directory (eg: `_runCommand res, "npm run push"`)
  _runCommand = (res, command, verbose = true, callback) ->
    try
      exec "cd #{ catalogPath } && #{ command }", (error, stdout, stderr) ->
        res.reply "#{ randomErrorMsg() }: | \n>>>#{ error }" if error
        res.reply "#{ randomErrorMsg() }: \n>>>#{ stderr }" if stderr and verbose
        res.send "\n>>>#{ stdout }" if stdout and verbose
        callback() if callback
    catch error
      res.reply "#{ randomErrorMsg() }: \n>>>#{ error }"


  # Under the hood: PUBLISH

  # Similar to the publish script from react-parts-catalog, it copies docs, updates Algolia & GitHub
  publish = (res) ->
    res.send "Uploading docs…"
    _copyDocs()

    res.send "Updating search index…"
    catalogIndex("production")

    res.send "Updating github repo…"
    _pushToGithub(res)

  # Copies the docs file from the react-parts-catalog to this directory.
  # You should mount it to match the one server uses.
  _copyDocs = ->
    from = path.resolve(catalogPath, "./data/docs.json")
    to = path.resolve(__dirname, "../data/docs.json")
    fs.createReadStream(from).pipe(fs.createWriteStream(to))

  # Push new component files to GitHub as Bender Rodriguez
  _pushToGithub = (res) ->
    _runCommand res, "npm run bender:set", false, ->
      _runCommand res, "npm run push", false, ->
        _runCommand res, "npm run bender:unset", false, ->
          res.reply "Ha ha! Components successfully pushed to GitHub!"


  # Under the hood: Catalog maintenance

  # Adds a component to the components file (type should be `web` or `native`)
  addComponent = (type, name, repo, description) ->
    components = {}
    components.web = readJSON(webComponentsFilename)
    components.native = readJSON(nativeComponentsFilename)
    components[type].push({ name: name, repo: repo, description: description })
    _saveFiles(components)
    robot.messageRoom room, "#{ name } added successfully!"

  # Removes a component from the components file
  removeComponent = (componentName) ->
    webComponents = readJSON(webComponentsFilename).filter((el) -> el.name != componentName)
    nativeComponents = readJSON(nativeComponentsFilename).filter((el) -> el.name != componentName)
    _saveFiles({ web: webComponents, native: nativeComponents })
    robot.messageRoom room, "#{ componentName } removed successfully!"

  # Updates a component in the components file
  editComponent = (componentName, prop, val) ->
    webComponents = readJSON(webComponentsFilename)
    nativeComponents = readJSON(nativeComponentsFilename)
    component = webComponents.concat(nativeComponents).find((el) -> el.name == componentName)
    component = _editComponent(component, prop, val)
    _saveFiles({ web: webComponents, native: nativeComponents })
    robot.messageRoom room, "#{ componentName } updated successfully!"

  _editComponent = (component, prop, val) ->
    switch prop
      when "repo"
        component.original_repo = component.repo
      when "description"
        component.original_description = component.description
    component[prop] = val
    return component

  # Add a component to the list of rejected components
  rejectComponent = (name, repo) ->
    components = readJSON(rejectedComponentsFilename)
    components.push({ name, repo })
    fs.writeFile(rejectedComponentsFilename, JSON.stringify(components, null, '  '))
    robot.messageRoom room, "#{ name } rejected successfully!"

  # Saves a hash with web & native components to the components file
  _saveFiles = (components) ->
    fs.writeFile(webComponentsFilename, JSON.stringify(components.web, null, '  '))
    fs.writeFile(nativeComponentsFilename, JSON.stringify(components.native, null, '  '))

  # Adds new components to the components file
  _addToFiles = (newComponents) ->
    components = {}
    components.web = readJSON(webComponentsFilename).concat(newComponents.web)
    components.native = readJSON(nativeComponentsFilename).concat(newComponents.native)
    _saveFiles(components)


  # Under the hood: Tweeting

  tweetComponent = ->
    _getGist (tweets) ->
      return unless tweets.length
      _tweet tweets.shift(), ->
        _updateGist tweets

  _generateTweet = (component, linkLength = 22, tweetMaxLength = 140) ->
    head = "🆕 #{ component.name }:"
    desc = component.description.trim().replace(/\.$/, '')
    link = "https://github.com/#{ component.repo }"
    descMaxLength = tweetMaxLength - linkLength - head.length - 2 # spaces
    desc = desc.substring(0, descMaxLength - 1) + "…" if desc.length > descMaxLength
    return "#{ head } #{ desc } #{ link }"

  # Generate text for new tweets based on array of components and save them on a gist
  _saveTweets = (newComponents) ->
    # Alternate between native and web components
    components = _(newComponents.native).zip(newComponents.web).flatten().compact().value()
    tweets = components.map (component) -> _generateTweet(component)
    robot.messageRoom room, "New tweets: \n>>> #{ tweets.join("\n") }"
    _getGist (oldTweets) ->
      _updateGist oldTweets.concat(tweets)

  _tweet = (tweet, callback) ->
    twitter.post "statuses/update", status: tweet, (error, data, response) ->
      return robot.messageRoom room, "#{ randomErrorMsg() }: #{ error.message }" if error
      callback()

  _getGist = (callback) ->
    robot.http("https://api.github.com/gists/#{ gist.id }")
      .header("Authorization", "token #{ gist.token }")
      .get() (error, res, body) ->
        return robot.messageRoom room, "#{ randomErrorMsg() }: #{ error.message }" if error
        return robot.messageRoom room, "#{ randomErrorMsg() }: #{ body.message }" if body.message

        json = JSON.parse body
        content = JSON.parse json.files["tweets.json"].content
        callback content

  _updateGist = (content) ->
    data = JSON.stringify
      description: "Pending tweets to be published by @reactparts",
      files:
        "tweets.json":
          content: JSON.stringify(content, null, '  ')

    robot.http("https://api.github.com/gists/#{ gist.id }")
      .header("Authorization", "token #{ gist.token }")
      .patch(data) (error, res, body) ->
        robot.messageRoom room, error.message if error
        robot.messageRoom room, body.message if body.message


  # Under the hood: Other helper methods

  readJSON = (filename) ->
    return JSON.parse fs.readFileSync(filename)

  asyncReadJSON = (filename, callback) ->
    fs.readFile filename, (error, data) ->
      return robot.messageRoom room, "#{ randomErrorMsg() }: #{ error }" if error
      callback JSON.parse(data)

  randomErrorMsg = ->
    return _.sample([
      "My pie-hucking appendage is malfunctioning",
      "My oven lamp is cold, and my tank treads do not roll",
      "My sensors indicate that some success is missing"
      "I have failed you father"
    ])
