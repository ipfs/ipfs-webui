# IPFS Web UI

> A web interface to [IPFS](https://ipfs.io).
>
> Check on your node stats, explore the IPLD powered merkle forest, see peers around the world and manage your files, without needing to touch the CLI.

![Screenshot of the status page](docs/screenshots/ipfs-webui-status.png)

| Files | Explore | Peers | Settings |
|-------|---------|-------|----------|
| ![Screenshot of the file browser page](docs/screenshots/ipfs-webui-files.png) | ![Screenshot of the IPLD explorer page](docs/screenshots/ipfs-webui-explore.png) | ![Screenshot of the swarm peers map](docs/screenshots/ipfs-webui-peers.png) | ![Screenshot of the settings page](docs/screenshots/ipfs-webui-settings.png) |


[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai/) [![](https://img.shields.io/badge/project-IPFS-blue.svg)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg)](http://webchat.freenode.net/?channels=%23ipfs) [![Build Status](https://travis-ci.org/ipfs-shipyard/ipfs-webui.svg?branch=revamp)](https://travis-ci.org/ipfs-shipyard/ipfs-webui) [![dependencies Status](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp/status.svg)](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp)

The IPFS WebUI is a **work-in-progress**. Help us make it better! We use the issues on this repo to track the work and it's part of the wider [IPFS GUI project](https://github.com/ipfs/ipfs-gui).

The app uses [`ipfs-http-client`](https://github.com/ipfs/js-ipfs-http-client) to communicate with your local IPFS node.

The app is built with [`create-react-app`](https://github.com/facebook/create-react-app). Please read the [docs](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#table-of-contents).

## Install

With `node` >= 8.12 and `npm` >= 6.4.1 installed, run

```sh
> npm install
```

## Usage

**When working on the code**, run an ipfs daemon, the local [dev server](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-start), the [unit tests](https://facebook.github.io/jest/), and the [storybook](https://storybook.js.org/) component viewer and see the results of your changes as you save files.

In separate shells run the following:

```sh
# Run IPFS
> ipfs daemon
```

```sh
# Run the dev server @ http://localhost:3000
> npm start
```

```sh
# Run the unit tests
> npm test
```

```sh
# Run the UI component viewer @ http://localhost:9009
> npm run storybook
```

### Configure IPFS API CORS headers

You must configure your IPFS API at http://127.0.0.1:5001  to allow [cross-origin (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) requests from your dev server at http://localhost:3000

Similarly if you want to try out pre-release versions at https://webui.ipfs.io you need to add that as an allowed domain too.

#### Easy mode

Run the **[cors-config.sh](./cors-config.sh)** script with:

```console
> ./cors-config.sh
```

#### The manual way

```console
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "https://webui.ipfs.io"]'
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```

#### Reverting

To reset your config back to the default configuration, run the following command.

```console
> ipfs config --json API.HTTPHeaders {}
```

You might also like to copy the `~/.ipfs/config` file somewhere with a useful name so you can use `ipfs config replace <file>` to switch your node between default and dev mode easily.

## Build

To create an optimized static build of the app, output to the `build` directory:

```sh
# Build out the html, css & jss to ./build
> npm run build
```

## Test

The following command will run the app tests, watch source files and re-run the tests when changes are made:

```sh
> npm test
```

The WebUI uses Jest to run the isolated unit tests. Unit test files are located next to the component they test and have the same file name, but with the extension `.test.js`

## End-to-end tests

The end-to-end tests (e2e) test the full app in a headless Chromium browser. They require an http server to be running to serve the app.

In dev, run `npm start` in another shell before starting the tests

```
# Run the end-to-end tests
> npm run test:e2e
```

By default the test run headless, so you won't see the the browser. To debug test errors, it can be helpful to see the robot clicking around the site. To disable headless mode and see the browser, set the environment variable `DEBUG=true`

```
# See the end-to-end tests in a browser
> DEBUG=true npm run test:e2e
```

In a **continuous integration** environment we lint the code, run the unit tests, build the app, start an http server and run the unit e2e tests.

```sh
> npm run lint
> npm test
> npm run build
> npm run test:ci:e2e
```

## Coverage

To do a single run of the tests and generate a coverage report, run the following:

```sh
> npm run test:coverage
```

## Lint

Perform [`standard`](https://standardjs.com/) linting on the code:

```sh
> npm run lint
```

## Analyze

To inspect the built bundle for bundled modules and their size, first `build` the app then:

```sh
# Run bundle
> npm run analyze
```

## Translations

The translations are stored on [./public/locales](./public/locales) and the English version is the source of truth. We use Transifex to help us translate WebUI to another languages.

**If you're interested in contributing a translation**, go to [our page on Transifex](https://www.transifex.com/ipfs/ipfs-webui/translate/), create an account, pick a language and start translating.

You can read more on how we use Transifex and i18next in this app at [`docs/LOCALIZATION.md`](docs/LOCALIZATION.md)

## Releasing a new version of the WebUI.

1. PR master with the result of `tx pull -a` to pull the latest translations from transifex
1. Tag it `npm version`, `git push`, `git push --tags`.
1. Add release notes to https://github.com/ipfs-shipyard/ipfs-webui/releases
1. Wait for master to [build on CI](https://ci.ipfs.team/blue/organizations/jenkins/IPFS%20Shipyard%2Fipfs-webui/activity?branch=master), and grab the CID for the build
1. Pin it on the IPFS cluster (see #ipfs-pinbot on freenode)
1. Update the hash at:
   - js-ipfs https://github.com/ipfs/js-ipfs/blob/master/src/http/api/routes/webui.js#L23
   - go-ipfs https://github.com/ipfs/go-ipfs/blob/master/core/corehttp/webui.go#L4
   - companion https://github.com/ipfs-shipyard/ipfs-companion/blob/master/package.json#L26
   - desktop https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/package.json#L15

## Contribute

Feel free to dive in! [Open an issue](https://github.com/ipfs-shipyard/ipfs-webui/issues/new) or submit PRs.

To contribute to IPFS in general, see the [contributing guide](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)


## License

[MIT](LICENSE) © Protocol Labs
