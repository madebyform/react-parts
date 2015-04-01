![React.parts — A catalog of React Native components](https://gc.david.tools/react-parts.svg)

#### Adding a new component to the catalog

React.parts relies on user-submitted pull requests to populate the catalog. Additional information and statistics about the components are fetched using the NPM and GitHub APIs. For now, we only accept components  that are published on the NPM registry and hosted on GitHub.

To add a new component, simply fork this repository to your own GitHub account and add your library to the `components.json` file. Here's an example:

```js
[
  {
    "name": "npm-package-name",
    "repo": "github-username/github-repository"
  }, …
]
```
