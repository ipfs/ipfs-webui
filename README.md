# IPFS webui

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Dependency Status](https://david-dm.org/ipfs/webui.svg?style=flat-square)](https://david-dm.org/ipfs/webui)
[![Circle CI](https://img.shields.io/circleci/project/ipfs/webui/master.svg?style=flat-square)](https://circleci.com/gh/ipfs/webui)
[![Travis CI](https://img.shields.io/travis/ipfs/webui/master.svg?style=flat-square)](https://travis-ci.org/ipfs/webui)

> The web interface for [IPFS](https://ipfs.io/)

IPFS Webui is a web interface for IPFS, the Interplanetary File System. With the interface, you can check on your node info, network addresses, see connections on a globe visually, see your files, look at your config and logs without needing to touch the CLI, and more. This interface uses the [js-ipfs-api](//github.com/ipfs/js-ipfs-api) for all of its heavy lifting.

The webui is a **work-in-progress**. Follow the [development](#development) processes below to check it out.

Otherwise, if you're curious about IPFS, head over to [ipfs/ipfs](//github.com/ipfs/ifps), or to the [golang](//github.com/ipfs/go-ipfs) or [nodejs](//github.com/ipfs/js-ipfs) implementations. The [website](https://ipfs.io) also has a host of resources on how to get started.

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Please contribute! The more people who work on this, the faster we'll be able to ship it. Dive in by testing it and [looking at the issues](https://github.com/ipfs/webui/issues).

The [CONTRIBUTING](CONTRIBUTING.md) file has more information relevant to this repo. To contribute to IPFS in general, just click on the image above to go to our [global contributing guide](https://github.com/ipfs/community/blob/master/contributing.md).

## Development

Make sure [node.js](https://nodejs.org/) version 4+ and [npm](https://docs.npmjs.com/) version 3+ are installed and in your path.

### Config

When developing the WebUI you will need an ipfs daemon running with API access on port `5001`, as well as the following configuration set, otherwise you will not be able to communicate with the ipfs node.

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
```

### Installation and running

```bash
$ git clone https://github.com/ipfs/webui
$ cd webui
$ npm install
# Runs server on port 3000.
$ npm start
```

### Resetting

To reset your config back to the default configuration, run the following command.

```sh
$ ipfs config --json API.HTTPHeaders {}
```

It might be a good idea to copy the `.ipfs/config` file somewhere with a useful name so you can use `ipfs config replace <file>` to switch between dev mode easily.

## Building

```bash
$ npm run build
# The result will be in /dist
```

## License

[MIT License](LICENSE)
