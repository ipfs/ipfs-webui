# WebUI CRA

> WebUI reboot with create-react-app

## Install

Clone this repo, and ensure you have the following installed:

* Node.js @ 10+
* npm @ 6+

In the project directory, install dependencies:

```js
npm install
```

### Develop

Run the following command to build the app, start a development server on http://localhost:3000 and enable hot code reloading:

```sh
npm start
```

### Test

The following command will run the app tests, watch source files and re-run the tests when changes are made:

```sh
npm test
```

In a continuous integration environment this will automatically do a single run of the tests and exit.

To do a single run of the tests and generate a coverage report, run the following:

```sh
npm run test:coverage
```

### Lint

The following command will perform linting on the code:

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

## License

[MIT](LICENSE) © Protocol Labs
