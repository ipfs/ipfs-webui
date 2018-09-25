# IPFS WebUI - Next

> A web interface to [IPFS](https://ipfs.io).
>
> Check on your node stats, explore the IPLD powered Merkel forest, see peers around the world and manage your files, without needing to touch the CLI.

![Screenshot of the status page](docs/screenshots/ipfs-webui-status.png)

| Files | Explore | Peers | Settings |
|-------|---------|-------|----------|
| ![Screenshot of the file browser page](docs/screenshots/ipfs-webui-files.png) | ![Screenshot of the IPLD explorer page](docs/screenshots/ipfs-webui-explore.png) | ![Screenshot of the swarm peers map](docs/screenshots/ipfs-webui-peers.png) | ![Screenshot of the settings page](docs/screenshots/ipfs-webui-settings.png) |


[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai/) [![](https://img.shields.io/badge/project-IPFS-blue.svg)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg)](http://webchat.freenode.net/?channels=%23ipfs) [![Build Status](https://travis-ci.org/ipfs-shipyard/ipfs-webui.svg?branch=revamp)](https://travis-ci.org/ipfs-shipyard/ipfs-webui) [![dependencies Status](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp/status.svg)](https://david-dm.org/ipfs-shipyard/ipfs-webui/revamp)

The IPFS WebUI is a **work-in-progress**. Help us make it better! We use the issues on this repo to track the work and it's part of the wider [IPFS GUI project](https://github.com/ipfs/ipfs-gui).

The app uses the IPFS HTTP API to get data from the ipfs node. It will use the `window.ipfs` api provided by the [IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) web-extension where available, and fallback to using [js-ipfs-api](https://github.com/ipfs/js-ipfs-api) where not.

The app is built with [`create-react-app`](https://github.com/facebook/create-react-app). Please read the [docs](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#table-of-contents).

## Install

With `node` >= 8.12 and `npm` >= 6.4.1 installed, run

```sh
> npm install
```

## Usage

**When working on the code**, run the [dev server](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-start), the [unit tests](https://facebook.github.io/jest/), and the [storybook](https://storybook.js.org/) component viewer and see the results of your changes as you save files.

In separate shells run the following:


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

## Config your IPFS Daemon

When developing the WebUI you will need an ipfs daemon running with API access on port `5001`, as well as the following configuration set, otherwise you will not be able to communicate with the ipfs node.

```bash
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
```

Alternatively, just run the quick config script with:

```bash
> ./quick-config.sh
```

To reset your config back to the default configuration, run the following command.

```bash
> ipfs config --json API.HTTPHeaders {}
```

It might be a good idea to copy the `.ipfs/config` file somewhere with a useful name so you can use `ipfs config replace <file>` to switch between dev mode easily.

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

The translations are stored on [./public/locales](./public/locales) and the English version is the source of truth.

We use Transifex to help us translate WebUI to another languages. If you're interested in contributing, go to [our page on Transifex](https://www.transifex.com/ipfs/ipfs-webui/translate/), create an account, pick a language and start translating.

### To Sync Translations

1. Install and set up [command-line client (`tx`)](https://docs.transifex.com/client/installing-the-client)
2. To download new translations from Transifex: `tx pull -a`
    - this should create/update files in `public/locales/*` that need to be committed
    - if a new language is created, remember to add it to `src/i18n.js`

### Namespaces and source files

We've split up our files by tab, so you can find the translations files at

- **Files** `->` `public/locales/en/files.json`
- **Explore** `->` `public/locales/en/explore.json`

..etc. The filename is the **namespace** that `i18next` will look up to find the keys for the right section.

We define our **source file** to be the `en` locale, in `public/locales/en/*`. Developers should update those files directly. Changes to from master branch are fetched by Transifex automatically every day for our lovely team of translators to ruminate on.

All other locales are `pull`ed from Transifex service via the `tx` commandline tool.

### Adding or updating keys

If you want to add new keys or change existing values in the `en` locale, you should make sure you have the latest from transifex first.

For example, before adding keys to `public/locales/en/explore.json`, first check you've got the latest source file:

```console
$ tx pull -r ipld-explorer.explore-json -s
tx INFO: Pulling translations for resource ipld-explorer.explore-json (source: public/locales/en/explore.json)
tx WARNING:  -> ko_KR: public/locales/ko_KR/explore.json
tx WARNING:  -> en: public/locales/en/explore.json
...
```

- `-s` means "include the source file when pulling", which in our case is the `en` versions.
- `-r ipld-explorer.explore-json` means just `explore.json` file. The mappings of resource name to files
is in the `.tx/config` file.

Now make your changes and add great keys and snappy `en` default values for them. When you are done, commit your changes as per usual. Changes to from master branch are fetched by Transifex automatically.

For **more info on our i18n process** at IPFS, check out:

- https://github.com/ipfs/i18n

## Releasing a new version of the WebUI.

1. Pull latest translations from transifex
1. Build it
1. Add to IPFS
1. Pin to the gateways
1. Add the new version to https://github.com/ipfs-shipyard/ipfs-webui/tree/master/versions
1. Update the hash at:
   - js-ipfs https://github.com/ipfs/js-ipfs/blob/master/src/http/api/routes/webui.js#L23
   - go-ipfs https://github.com/ipfs/go-ipfs/blob/master/core/corehttp/webui.go#L4


## Contribute

Feel free to dive in! [Open an issue](https://github.com/ipfs-shipyard/ipfs-webiui/issues/new) or submit PRs.

To contribute to IPFS in general, see the [contributing guide](https://github.com/ipfs/community/blob/master/contributing.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)


## License

[MIT](LICENSE) © Protocol Labs
