# IPFS WebUI

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://david-dm.org/ipfs-shipyard/ipfs-webui.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-webui)
[![](https://img.shields.io/circleci/project/ipfs-shipyard/ipfs-webui/master.svg?style=flat-square)](https://circleci.com/gh/ipfs-shipyard/ipfs-webui)
[![](https://img.shields.io/travis/ipfs-shipyard/ipfs-webui/master.svg?style=flat-square)](https://travis-ci.org/ipfs-shipyard/ipfs-webui)
[![](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fwebui.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fwebui?ref=badge_shield)

> IPFS WebUI is a web interface for [IPFS](https://ipfs.io), the Interplanetary File System. With the interface, you can check on your node info, network addresses, see connections on a globe visually, see your files, look at your config and logs without needing to touch the CLI, and more. This interface uses the [js-ipfs-api](//github.com/ipfs/js-ipfs-api) for all of its heavy lifting.

The WebUI is a **work-in-progress**. Follow the [development](#development) processes below to check it out.

# Usage

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

## Reset your IPFS Daemon config

To reset your config back to the default configuration, run the following command.

```bash
> ipfs config --json API.HTTPHeaders {}
```

It might be a good idea to copy the `.ipfs/config` file somewhere with a useful name so you can use `ipfs config replace <file>` to switch between dev mode easily.

## Installation and running

```bash
> git clone https://github.com/ipfs/webui
> cd webui
> npm install
# Runs server on port 3000.
> npm start
```

## Building

```bash
> npm run build
# The result will be in /dist
```

# Release a new version of the WebUI.

When a new version is ready, make sure to:

1. bundle
1. add to IPFS
1. pin to the gateways
1. add the new version to https://github.com/ipfs-shipyard/ipfs-webui/tree/master/versions
1. update the hash at:
   - js-ipfs https://github.com/ipfs/js-ipfs/blob/master/src/http/api/routes/webui.js#L23
   - go-ipfs https://github.com/ipfs/go-ipfs/blob/master/core/corehttp/webui.go#L4

# Development

Make sure [node.js](https://nodejs.org/) version 6 and [npm](https://docs.npmjs.com/) version 3+ are installed and in your path.
# Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Please contribute! The more people who work on this, the faster we'll be able to ship it. Dive in by testing it and [looking at the issues](https://github.com/ipfs/webui/issues).

The [CONTRIBUTING](CONTRIBUTING.md) file has more information relevant to this repo. To contribute to IPFS in general, just click on the image above to go to our [global contributing guide](https://github.com/ipfs/community/blob/master/contributing.md).

# License

[MIT License](LICENSE)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fwebui.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fwebui?ref=badge_large)
