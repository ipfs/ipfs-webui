# IPFS WebUI Next

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/tableflip/ipfs-webui-cra.svg?branch=master)](https://travis-ci.org/tableflip/ipfs-webui-cra)

> IPFS WebUI reboot. A new frontend for your IPFS node.

## This is pre-release software.

The current IPFS webui is here: https://github.com/ipfs-shipyard/ipfs-webui

This repo is part of the IPFS GUI redesign project, described here: https://github.com/ipfs-shipyard/pm-ipfs-gui

## Install

Clone this repo, and ensure you have the following installed:

* `node` @ 10+
* `npm` @ 6+

In the project directory, install dependencies:

```js
npm install
```

### Develop

This app is built with [`create-react-app`](https://github.com/facebook/create-react-app). Please read the [docs](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#table-of-contents).

Run the following command to build the app, start a development server on http://localhost:3000 and enable hot code reloading:

```sh
npm start
```

### Test

The following command will run the app tests, watch source files and re-run the tests when changes are made:

```sh
npm test
```

The tests include both isolated unit tests and end-to-end tests so they require an http server be running to serve the app. In dev, run `npm start` in another shell before starting the tests.

In a continuous integration environment this will ensure the app builds, start an http server and do a single run of the tests and exit:

```sh
npm run build
npm run test:ci
```

To do a single run of the tests and generate a coverage report, run the following:

```sh
npm run test:coverage
```

### Lint

The following command will perform [`standard`](https://standardjs.com/) linting on the code:

```sh
npm run lint
```

### Build

To create a production ready build of the app, output to `build`, run the following command:

```sh
npm run build
```

### Analyze

To inspect the built bundle for bundled modules and their size, run the following:

```sh
npm run analyze
```

Note that you'll need to build the application first.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/ipfs-shipyard/TBC/issues/new) or submit PRs.

To contribute to IPFS in general, see the [contributing guide](https://github.com/ipfs/community/blob/master/contributing.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)


## License

[MIT](LICENSE) © Protocol Labs
