# IPFS WebUI - Next

![Screenshot of IPLD explorer page](https://user-images.githubusercontent.com/58871/41230416-a4c93376-6d77-11e8-9cab-0d4a1c103d27.png)

> IPFS WebUI reboot. A new frontend for your IPFS node.

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai/) [![](https://img.shields.io/badge/project-IPFS-blue.svg)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg)](http://webchat.freenode.net/?channels=%23ipfs) [![Build Status](https://travis-ci.org/ipfs-shipyard/ipfs-webui.svg?branch=revamp)](https://travis-ci.org/ipfs-shipyard/ipfs-webui) [![dependencies Status](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp/status.svg)](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp)

## Background

### This is pre-release software.

The current IPFS webui is here: https://github.com/ipfs-shipyard/ipfs-webui

This repo is part of the IPFS GUI redesign project, described here: https://github.com/ipfs-shipyard/pm-ipfs-gui

The app accesses a local IPFS daemon via [`window.ipfs-fallback`](https://github.com/tableflip/window.ipfs-fallback). It will use the `window.ipfs` api provided by the [IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) web-extension where available, and fallback to using [js-ipfs-api](https://github.com/ipfs/js-ipfs-api)

The app is built with [`create-react-app`](https://github.com/facebook/create-react-app). Please read the [docs](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#table-of-contents).

## Install

With `node` > 8.9 and `npm` @ 6+ installed, run

```js
npm install
```

## Usage

When developing you can run the [dev server](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-start), the [unit tests](https://facebook.github.io/jest/), and the [storybook](https://storybook.js.org/) component viewer and see the results of your changes as you save files.

In separate shells run the following:

```sh
# Run the unit tests
npm test
```

```sh
# Run the dev server @ http://localhost:3000
npm start
```

```sh
# Run the UI component viewer @ http://localhost:9009
npm run storybook
```

## Build

To create an optimized static build of the app, output to the `build` directory:

```sh
# Build out the html, css & jss to ./build
npm run build
```

### Analyze

To inspect the built bundle for bundled modules and their size, first `build` the app then:

```sh
# Run bundle
npm run analyze
```

## Test

The following command will run the app tests, watch source files and re-run the tests when changes are made:

```sh
npm test
```

The uses Jest to run the isolated unit tests. Unit test files are located next to the component they test and have the same file name, but with the extension `.test.js`

### Linting

The following command will perform [`standard`](https://standardjs.com/) linting on the code:

```sh
npm run lint
```

### End-to-end tests

The end-to-end tests (e2e) test the full app in a headless Chromium browser. They require an http server be running to serve the app.

In dev, run `npm start` in another shell before starting the tests

```
# Run the end-to-end tests
npm run test:e2e
```

By default the test run headless, so you won't see the the browser. To debug test errors, it can be helpful to see the robot clicking around the site. To disable headless mode and see the browser, set the environment variable `DEBUG=true`

```
# See the end-to-end tests in a browser
DEBUG=true npm run test:e2e
```

### CI

In a continuous integration environment we lint the code, run the unit tests, build the app, start an http server and run the unit e2e tests.

```sh
npm run lint
npm test
npm run build
npm run test:ci:e2e
```

### Coverage

To do a single run of the tests and generate a coverage report, run the following:

```sh
npm run test:coverage
```

### i18n

The translations are stored on [./public/locales](./public/locales) and the English version is the source of truth.

We use Transifex to help us translate WebUI to another languages. If you're interested in contributing, go to [our page on Transifex](https://www.transifex.com/ipfs/ipfs-webui/translate/), create an account, pick a language and start translating.

#### To Start Translating

1. [Create Transifex account](https://www.transifex.com/signup/?join_project=ipfs-webui) 
2. Go to https://www.transifex.com/ipfs/ipfs-webui/translate/, pick a language, and start translating
       
#### To Sync Translations

1. Install and set up [command-line client (`tx`)](https://docs.transifex.com/client/installing-the-client)
2. To download new translations from Transifex: `tx pull -a` 
    - this should create/update files in `public/locales/*` that need to be commited
    - if a new language is created, remember to add it to `src/i18n.js`

## Transifex 101

- [Installing the Transifex Client](https://docs.transifex.com/client/installing-the-client)
- [Understanding `.tx/config` file](https://docs.transifex.com/client/client-configuration#section-tx-config)
- Manual sync via Transifex Client 
  -  [Using Transifex with GitHub in Your Development Workflow](https://docs.transifex.com/integrations/github)
     - [Syncing a local project to Transifex with the Transifex Client](https://docs.transifex.com/integrations/github#section-using-the-client)

## Contribute

Feel free to dive in! [Open an issue](https://github.com/ipfs-shipyard/TBC/issues/new) or submit PRs.

To contribute to IPFS in general, see the [contributing guide](https://github.com/ipfs/community/blob/master/contributing.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)


## License

[MIT](LICENSE) © Protocol Labs
