# Translating the IPFS Web UI

Welcome to the Web UI branch of the [IPFS Translation Project  🌐✍️🖖](https://github.com/ipfs/i18n)

We use [transifex.com](https://www.transifex.com/ipfs/public/) to manage translations. **Please don't edit the locale files directly.**

For more info on our i18n process at IPFS, check out: https://github.com/ipfs/i18n


## Pulling translations from Transifex

1. Install and set up [command-line client (`tx`)](https://docs.transifex.com/client/installing-the-client)
2. To download new translations from Transifex: `tx pull -a`
    - this should create/update files in `public/locales/*` that need to be committed
    - if a new language is created, remember to add it to `src/i18n.js`
3. If there are new locales, run [`lol`](https://github.com/olizilla/lol) to update our [`languages.json`](src/lib/languages.json)

```console
npx -q @olizilla/lol public/locales > src/lib/languages.json
```


## Namespaces and source files

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
