[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

### Adding a new project to the catalog

In order to be listed in the catalog, a React-related project should meet the following criteria:

- **Unscoped package published in the NPM registry**: Your package must be [published](https://docs.npmjs.com/cli/publish) on the NPM registry. Currently, [scoped packages](https://docs.npmjs.com/misc/scope) are omitted from search results, and because of that we need the package name to be unscoped.
- **The `package.json` file has a [`repository`](https://docs.npmjs.com/files/package.json#repository) property that points to GitHub**: We currently use GitHub for displaying stars, documentation and for detecting platform support (in the case of React Native). Please, set the `repository` property so we can find your repo.
- **The `package.json` file has a [`keywords`](https://docs.npmjs.com/files/package.json#keywords) property**: It improves discoverability if you add the `react-component` keyword to your `package.json`. If your package is for React Native, we recommend that you also add the `react-native` and `ios` keywords, and/or alternatively `android` (depending on which platforms your package supports).
- **ReadMe file with usage examples**: The package should include instructions and examples.

Here's an example of a `package.json` file for a React Native component:

```js
{
  "name": "my-npm-package-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/owner-name/repository-name"
  },
  "description": "A short description of your package",
  "keywords": [
    "react-component",
    "react-native",
    "ios",
    "android"
  ],
  "peerDependencies": {
    "react-native": "^0.14.2"
  }, …
}
```

The React ecosystem is made by so much more than components, and so we have been adding other kinds of packages to the catalog, including mixins, boilerplates, generators and other libraries that are related to React, Flux or GraphQL. All packages are manually reviewed, so keep in mind that your package may take days before being added to the catalog.
