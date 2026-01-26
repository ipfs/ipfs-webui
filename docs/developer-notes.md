# Developer Notes

This document covers development setup, testing, and debugging for IPFS Web UI.

## Table of Contents

- [Development Setup](#development-setup)
- [Configure CORS](#configure-cors)
- [Running Tests](#running-tests)
- [E2E Tests](#e2e-tests)
- [Code Style](#code-style)
- [Bundle Analysis](#bundle-analysis)

## Development Setup

### Prerequisites

We pin specific versions of Node.js and Go in [`.tool-versions`](../.tool-versions) to avoid CI breakage from upstream changes. Breaking changes in Node.js and GitHub Actions have caused test failures multiple times, so we use explicit versions to avoid wasting developer time debugging unrelated regressions.

If you use [asdf](https://asdf-vm.com/) or compatible tooling, run `asdf install` to set up the correct versions automatically.

### Install Dependencies

```console
$ npm install
```

### Development Workflow

Run these in separate terminal windows:

```console
$ ipfs daemon                    # Run Kubo daemon
$ npm start                      # Dev server at http://localhost:3000
$ npm run test:unit:watch        # Unit tests in watch mode
$ npm run storybook              # Component viewer at http://localhost:9009
```

The app is built with [`create-react-app`](https://github.com/facebook/create-react-app). See the [CRA docs](https://github.com/facebook/create-react-app/blob/main/packages/cra-template/template/README.md) for more details.

### Build

Create an optimized production build in the `build` directory:

```console
$ npm run build
```

## Configure CORS

You must configure your Kubo RPC endpoint at `http://127.0.0.1:5001` to allow [cross-origin (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) requests from your dev server at `http://localhost:3000`.

### Easy Mode

Run the CORS configuration script:

```console
$ ./cors-config.sh
```

### Manual Configuration

```console
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "https://webui.ipfs.io", "http://127.0.0.1:5001"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["POST"]'
```

### Reset to Default

```console
$ ipfs config --json API.HTTPHeaders {}
```

> [!TIP]
> Copy `~/.ipfs/config` somewhere with a useful name so you can use `ipfs config replace <file>` to switch between default and dev mode easily.

## Running Tests

Run all tests (unit + E2E):

```console
$ npm test
```

### Unit Tests

The WebUI uses Jest for isolated unit tests. Test files are located next to the component they test with the extension `.test.js`.

```console
$ npm run test:unit              # Single run
$ npm run test:unit:watch        # Watch mode
$ npm run test:unit:coverage     # With coverage report
```

### Coverage Report

Generate a coverage report:

```console
$ npm run test:coverage
```

## E2E Tests

End-to-end tests run the full app in a headless Chromium browser using Playwright. They spawn a real Kubo node for HTTP RPC and a static HTTP server to serve the app.

Test files are located in `test/e2e/`.

```console
$ npm run build                  # Build first!
$ npm run test:e2e               # Run E2E tests
```

### Customizing E2E Tests

#### `IPFS_GO_EXEC`

Override the Kubo binary used in tests:

```console
$ IPFS_GO_EXEC=$GOPATH/bin/ipfs npm run test:e2e
```

You can also test against different Kubo versions by modifying `kubo` in `devDependencies` of `package.json`.

#### `E2E_API_URL`

Point tests at an existing Kubo RPC API instead of spawning a new node:

```console
$ E2E_API_URL=http://127.0.0.1:5001 npm run test:e2e
```

> [!WARNING]
> The RPC API must run on localhost for Peers screen tests to pass (they test manual swarm connect to ephemeral `/ip4/127.0.0.1/..` multiaddr).

CORS must be configured for `http://localhost:3001`:

```console
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3001", "http://127.0.0.1:5001"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["POST"]'
```

### Debugging E2E Tests

#### Show the Browser

By default, tests run headless. To see the browser:

```console
$ DEBUG=true npm run test:e2e
```

#### Run Specific Tests

```console
$ npm run test:e2e -- --grep "Settings"
```

#### Breakpoints

Use `await page.pause()` in test code to pause execution.

See [Playwright debugging docs](https://playwright.dev/docs/debug#using-pagepause) for more options.

## Code Style

We use ESLint for linting and TypeScript for type checking:

```console
$ npm run lint                   # Run eslint, typecheck, and dep-check
$ npm run eslint                 # Run eslint only
```

## Bundle Analysis

Inspect the production bundle for size and included modules:

```console
$ npm run build
$ npm run analyze
```
