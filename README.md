# IPFS Web UI

> A web interface to [IPFS](https://ipfs.tech), shipped with [Kubo](https://github.com/ipfs/kubo), and [ipfs-desktop](https://github.com/ipfs/ipfs-desktop/).
>
> Check on your node stats, explore the IPLD powered merkle forest, see peers around the world and manage your files, without needing to touch the CLI.

![Screenshot of the status page](docs/screenshots/ipfs-webui-status.png)

| Files | Explore | Peers | Settings |
|-------|---------|-------|----------|
| ![Screenshot of the file browser page](docs/screenshots/ipfs-webui-files.png) | ![Screenshot of the IPLD explorer page](docs/screenshots/ipfs-webui-explore.png) | ![Screenshot of the swarm peers map](docs/screenshots/ipfs-webui-peers.png) | ![Screenshot of the settings page](docs/screenshots/ipfs-webui-settings.png) |

<p align="center">
  <a href="https://github.com/ipfs/ipfs-webui/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/release/ipfs/ipfs-webui.svg"></a>
  <a href="https://github.com/ipfs/ipfs-webui/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/ipfs/ipfs-webui/ci.yml?branch=main"></a>
  <a href="https://explore.transifex.com/ipfs/ipfs-webui/"><img alt="i18n status" src="https://img.shields.io/badge/i18n-translated-blue.svg"></a>
  <a href="https://discuss.ipfs.tech"><img alt="Discourse Forum" src="https://img.shields.io/discourse/posts?server=https%3A%2F%2Fdiscuss.ipfs.tech"></a>
</p>

<hr />

<p align="center">
  <b><a href="#what-is-ipfs-web-ui">What is IPFS Web UI?</a></b> | <b><a href="#usage">Usage</a></b> | <b><a href="#development">Development</a></b> | <b><a href="#translations">Translations</a></b> | <b><a href="#getting-help">Getting Help</a></b>
</p>

## What is IPFS Web UI?

IPFS Web UI is a browser-based interface for interacting with your [Kubo](https://github.com/ipfs/kubo) node. It uses [`kubo-rpc-client`](https://github.com/ipfs/js-kubo-rpc-client) to communicate with your local Kubo RPC API.

**Features:**

- **Status** - View your Kubo node's connection status, peer count, bandwidth, and repo stats
- **Files** - Browse, upload, download, and manage files in your Kubo node
- **Explore** - Navigate the IPLD DAG and inspect CIDs
- **Peers** - See connected peers on a world map and manage connections
- **Settings** - Configure your Kubo node, manage pinning services, and customize the UI

**Where to access it:**

- Bundled with [Kubo](https://github.com/ipfs/kubo) at `http://127.0.0.1:5001/webui`
- Bundled with [IPFS Desktop](https://github.com/ipfs/ipfs-desktop)
- Latest release: https://webui.ipfs.io
- Preview of `main` branch: https://dev.webui.ipfs.io

## Usage

### Running with Kubo

If you have [Kubo](https://docs.ipfs.tech/install/command-line/) installed, Web UI is available at http://127.0.0.1:5001/webui when your daemon is running.

### Running with Docker

```console
$ docker pull ipfs/kubo
$ docker run -p 8080:8080 -p 5001:5001 -it ipfs/kubo
```

See the [Kubo Docker Hub page](https://hub.docker.com/r/ipfs/kubo) for more options.

## Development

See [docs/developer-notes.md](docs/developer-notes.md) for detailed development instructions.

**Quick start:**

```console
$ npm install                  # Install dependencies
$ ./cors-config.sh             # Configure CORS for local development
$ ipfs daemon                  # Start Kubo daemon (in separate terminal)
$ npm start                    # Start dev server at http://localhost:3000
```

**Other commands:**

```console
$ npm test                     # Run all tests
$ npm run build                # Build for production
$ npm run storybook            # Component viewer at http://localhost:9009
$ npm run lint                 # Run linter
```

> [!NOTE]
> The Node.js version is pinned in [`.tool-versions`](./.tool-versions). If you use [asdf](https://asdf-vm.com/), run `asdf install` to set up the correct version.

## Translations

The UI is available in multiple languages. Translations are managed on [Transifex](https://explore.transifex.com/ipfs/ipfs-webui/).

- Switch languages via _Settings_ or the `?lng=<lang-code>` URL parameter
- Translation files are in [`./public/locales`](./public/locales)
- See [`docs/LOCALIZATION.md`](docs/LOCALIZATION.md) for details on contributing translations

## Getting Help

- [IPFS Forum](https://discuss.ipfs.tech) - community support and discussion
- [Matrix chat](https://matrix.to/#/#lobby:ipfs.io) - real-time chat with the community
- [GitHub Issues](https://github.com/ipfs/ipfs-webui/issues) - bug reports and feature requests

## Security Issues

To report a security issue, please follow the [IPFS Security Policy](https://github.com/ipfs/community/blob/master/SECURITY.md).

## Contributing

[![](https://cdn.jsdelivr.net/gh/jbenet/contribute-ipfs-gif@b59c59b52e58e1ddc29427bea15ce54ecb2872c2/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

We welcome contributions! See [docs/developer-notes.md](docs/developer-notes.md) for development setup and guidelines.

This repository follows the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## Maintainer Info

<a href="https://ipshipyard.com/"><img align="right" src="https://github.com/user-attachments/assets/39ed3504-bb71-47f6-9bf8-cb9a1698f272" /></a>

> [!NOTE]
> This project is maintained by the [Shipyard](https://ipshipyard.com/) team.
>
> [Releasing a new version](docs/RELEASING.md)

## License

[MIT](LICENSE)
