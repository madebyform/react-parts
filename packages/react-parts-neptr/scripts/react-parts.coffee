fs = require('fs')
path = require('path')
url = require('url')
exec = require('child_process').exec
_ = require('lodash')
webshot = require('webshot')

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

# Configurations
appUrl = process.env.HEROKU_URL || "http://localhost/"
room = "scripts" # Room to where neptr should send messages
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

# Utility functions

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
    "This thing failed miserably"
  ])

msgUnknown = ->
  "Can't understand what you mean, creator. Why, creator? Does it please you to watch me struggle?"

module.exports = (robot) ->
  # @param [String] Greet creator if time since last greeting > interval
  greet = (res, interval = 60 * 60 * 1000) ->
    if Date.now() - robot.brain.get("greetings") > interval
      res.reply "Greetings, creator! Neptr is fully functional!"
      robot.brain.set("greetings", Date.now())

  # Run a command inside the react-parts-catalog directory
  # Example: `_runCommand res, "npm run push"`
  _runCommand = (res, command, verbose = true, callback) ->
    try
      exec "cd #{ catalogPath } && #{ command }", (error, stdout, stderr) ->
        res.reply "#{ randomErrorMsg() }: | \n>>>#{ error }" if error
        res.reply "#{ randomErrorMsg() }: \n>>>#{ stderr }" if stderr and verbose
        res.send "\n>>>#{ stdout }" if stdout and verbose
        callback() if callback
    catch error
      res.reply "#{ randomErrorMsg() }: \n>>>#{ error }"

  # Print changes done to the components files in react-parts-catalog
  diffComponents = (res) ->
    _runCommand res, "git diff components/react-web.json", true, ->
      _runCommand res, "git diff components/react-native.json"

  # Fetches new metadata for all web & native components and updates both component & data
  # files using react-parts-catalog's fetcher
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
      if i <= numBatchesWeb
        res.send "Fetching web batch #{ i } of #{ numBatchesWeb }…" if i % 5 == 0
        i += 1
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
      if i <= numBatchesNative
        res.send "Fetching native batch #{ i } of #{ numBatchesNative }…" if i % 5 == 0
        i += 1
        error = (ref, msg) -> sendError({ ref, msg }, i, numBatchesNative)
        warn = (ref, msg) -> sendWarn({ ref, msg }, i, numBatchesNative)
        catalogFetch "react-native", _fetchNative, batchIndex: i, error: error, warn: warn, \
          components: nativeComponents, rejected: rejectedComponents, data: nativeData, docs: docs
      else
        fs.writeFile(nativeComponentsFilename, JSON.stringify(nativeComponents, null, '  '))
        fs.writeFile(nativeDataFilename, JSON.stringify(nativeData, null, '  '))
        fs.writeFile(docsFilename, JSON.stringify(docs, null, '  '))
        res.send "Finished fetching native components, creator!"
        _fetchWeb(1, webComponents, webData, docs)
    _fetchNative(1, nativeComponents, nativeData, docs)

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

  # Similar to the publish script from react-parts-catalog, it copies docs, updates algolia & github
  publish = (res) ->
    res.send "Uploading docs…"
    _copyDocs()

    res.send "Updating search index…"
    catalogIndex("production")

    res.send "Updating github repo…"
    _pushToGithub(res)

  # Adds a component to the components file
  # @param [String] type Should be `web` or `native`
  addComponent = (type, json) ->
    components = {}
    components.web = readJSON(webComponentsFilename)
    components.native = readJSON(nativeComponentsFilename)
    components[type].push(json)
    _saveFiles(components)
    robot.messageRoom room, "Data added successfully!"

  # Removes a component from the components file
  removeComponent = (componentName) ->
    webComponents = readJSON(webComponentsFilename).filter((el) -> el.name != componentName)
    nativeComponents = readJSON(nativeComponentsFilename).filter((el) -> el.name != componentName)
    _saveFiles({ web: webComponents, native: nativeComponents })
    robot.messageRoom room, "#{ componentName } removed successfully!"

  # Updates a component in the components file
  updateExistingComponent = (componentName, prop, val) ->
    webComponents = readJSON(webComponentsFilename)
    nativeComponents = readJSON(nativeComponentsFilename)
    component = webComponents.concat(nativeComponents).find((el) -> el.name == componentName)
    component = _editComponent(component, prop, val)
    _saveFiles({ web: webComponents, native: nativeComponents })
    robot.messageRoom room, "#{ componentName } updated successfully!"

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

  # Generate text for new tweets based on array of components
  _tweets = (newComponents) ->
    # Alternate between native and web components
    components = _(newComponents.native).zip(newComponents.web).flatten().compact().value()

    components.forEach (component) ->
      tweet = "🆕 #{ component.name }: <DSC>"
      maxLength = 140 - 29 - tweet.length
      homepage = "https://github.com/#{ component.repo }"
      description = "#{ component.description }"

      if description.length > maxLength
        description = description.substring(0, maxLength - 1) + "…";
      else if description[description.length - 1] == "."
        description = description.substring(0, description.length - 1)

      tweet = tweet.replace("<DSC>", description) + " #{ homepage }"

      if robot.adapterName != "slack"
        robot.messageRoom room, tweet
      else
        robot.emit "slack-attachment",
          channel: room
          content:
            fallback: "New tweet: #{ tweet }"
            color: "#5CACE8",
            text: tweet

  # Finishes the process of reviewing by saving the changes and generating tweets
  _finishReviewing = ->
    acceptedComponents = robot.brain.get("acceptedComponents")
    _addToFiles(acceptedComponents)
    robot.brain.remove("context")
    robot.messageRoom room, "New components saved successfully!"
    _tweets(acceptedComponents)

  _editComponent = (component, prop, val) ->
    switch prop
      when "repo"
        component.original_repo = component.repo
      when "description"
        component.original_description = component.description
    component[prop] = val
    return component

  # Edit a component that is being reviewed
  # Example: `_editComponent component, "repo", "new-repo-user/new-repo-name"`
  editPendingComponent = (prop, val) ->
    pendingComponents = robot.brain.get("pendingComponents")
    if (pendingComponents.web.length)
      component = pendingComponents.web[0]
    else if (pendingComponents.native.length)
      component = pendingComponents.native[0]
    component = _editComponent(component, prop, val)
    robot.messageRoom room, "Component updated successfully!"

  # Don't accept a pending component. It is not added to the rejected list
  declinePendingComponent = ->
    pendingComponents = robot.brain.get("pendingComponents")
    if (pendingComponents.web.length)
      pendingComponents.web.shift()
    else
      pendingComponents.native.shift()
    _askReview()

  # Accept a pending component
  acceptPendingComponent = ->
    pendingComponents = robot.brain.get("pendingComponents")
    acceptedComponents = robot.brain.get("acceptedComponents")
    if (pendingComponents.web.length)
      acceptedComponents.web.push(pendingComponents.web.shift())
    else
      acceptedComponents.native.push(pendingComponents.native.shift())
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
      _finishReviewing()
      return

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

  _startReviewing = (res, pendingComponents) ->
    robot.brain.set("pendingComponents", pendingComponents)
    robot.brain.set("context", "review")
    _askReview()

  # @param [String] arg "yesterday", "all" or a parsable date string
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

  # @param [String] arg "yesterday", "all" or a parsable date string
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

  # @param [String] arg "yesterday", "all" or a parsable date string
  pull = (res, arg) ->
    _download res, arg, (json) ->
      _parse res, arg, json, (pendingComponents) ->
        _startReviewing res, pendingComponents

  parse = (res, arg) ->
    npmFile = path.resolve(catalogPath, "./data/npm.json")
    asyncReadJSON npmFile, (json) ->
      _parse res, arg, json, (pendingComponents) ->
        _startReviewing res, pendingComponents

  reset = ->
    robot.brain.remove("context")
    robot.brain.set("pendingComponents", { web: [], native: [] })
    robot.brain.set("acceptedComponents", { web: [], native: [] })

  robot.hear /^hello$/i, (res) ->
    greet res, 0

  robot.hear /^pull (.*)$/i, (res) ->
    reset()
    greet res
    pull res, res.match[1]

  robot.hear /^pull$/i, (res) ->
    reset()
    greet res
    pull res, "yesterday"

  robot.hear /^parse (.*)$/i, (res) ->
    reset()
    greet res
    parse res, res.match[1]

  robot.hear /^y(?:es)?$/i, (res) ->
    acceptPendingComponent() if robot.brain.get("context") == "review"

  robot.hear /^n(?:o)?$/i, (res) ->
    declinePendingComponent() if robot.brain.get("context") == "review"

  robot.hear /^e(?:dit)? (.*):(.*)$/i, (res) ->
    return unless robot.brain.get("context") == "review"
    prop = res.match[1]
    val = res.match[2]
    if prop and val
      editPendingComponent(prop, val)
    else
      res.reply msgUnknown()

  robot.hear /^publish$/i, (res) ->
    publish res

  robot.hear /^update$/i, (res) ->
    updateMetadata(res)

  robot.hear /^diff$/i, (res) ->
    diffComponents res

  # Usage example: `catalog edit component-name description:new-description`
  robot.hear /^catalog e(?:dit)? (.*) (.*):(.*)$/i, (res) ->
    componentName = res.match[1]
    prop = res.match[2]
    val = res.match[3]
    if prop and val
      updateExistingComponent(componentName, prop, val)
    else
      res.reply msgUnknown()

  # Usage example: `catalog remove component-name`
  robot.hear /^catalog r(?:emove)? (.*)$/i, (res) ->
    componentName = res.match[1]
    removeComponent(componentName)

  # Usage example: `catalog reject component-name component-repouser/component-reponame`
  robot.hear /^catalog reject (.*) (.*)$/i, (res) ->
    name = res.match[1]
    repo = res.match[2]
    if name and repo
      rejectComponent(name, repo)
    else
      res.reply msgUnknown()

  # TODO Allow to add a new catalog at anytime
  robot.hear /^catalog a(?:dd)? (.*) \n```(.*)\n```$/i, (res) ->
    type = res.match[1]
    json = JSON.parse(res.match[2])
    if type and json
      addComponent(type, json)
    else
      res.reply msgUnknown()

  # Serve screenshots
  robot.router.get url.resolve(screenshots.path, ":componentName"), (req, res) ->
    res.sendfile path.join(screenshots.filepath, req.params.componentName)

  # Root, for monitoring
  robot.router.get "/", (req, res) ->
    res.send "Hello, friend!"
