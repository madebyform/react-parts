![React.parts — A catalog of React Native components](https://gc.david.tools/react-parts.svg)

#### Adding a new component to the catalog

If you want your React Native component to show up in the catalog, simply add the `react-component` keyword to your `package.json` file and publish it on the NPM registry. We recommend that you also add the `react-native` and `ios` keywords. Finally, make sure your package has `react-native` in the `dependencies` property. Here's an example:

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

We manually curate the results from NPM, to prevent packages that are not React Native components from being displayed, and update the site regularly. We also retrieve additional information from your GitHub repository. If your component's source code is not hosted by Github, we will not be able to show detailed statistics for the time being.

#### About React for Web

There are already some [great](http://react-components.com/) [websites](http://www.reactjsx.com/) for React components for the Web. We are also planning to add a separate section for them to [React.parts](https://react.parts).
