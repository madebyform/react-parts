[![React.parts — A catalog of React Native components](https://react.parts/react-parts.svg)](https://react.parts)

#### Adding a new component to the catalog

If you want your React component to show up in the catalog, simply add the `react-component` keyword to your `package.json` file and publish it on the NPM registry. If your component is for React Native, we recommend that you also add the `react-native` and `ios` keywords, and make sure your package has `react-native` in the [`dependencies`](https://docs.npmjs.com/files/package.json#dependencies) property. Here's an example for React Native:

```js
{
  "name": "my-npm-package-name",
  "keywords": [
    "react-component",
    "react-native",
    "ios"
  ],
  "dependencies": {
    "react-native": "^0.3.1"
  }
}, …
```

We also retrieve additional information from GitHub. If your component's source code is not hosted on Github, or you didn't specify the [`repository`](https://docs.npmjs.com/files/package.json#repository) property in your `package.json` file, we will not be able to show statistics (such as stars) for the time being. Results from NPM are manually curated and the site is updated regularly.
