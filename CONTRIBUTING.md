# Contributing

### Internationalization

IPFS WebUI has internationalization support, strings for translation can be marked by the i18n.t function.
Example: `<h3>Node Info</h3>` becomes `<h3>{i18n.t('Node Info')}</h3>`. If you add a new string like this, be sure
to add it to `static/locale/webui-en.json` as well, otherwise it would not be displayed in the UI. The same applies
if you need to edit an existing string.

Our translation project is here: https://www.transifex.com/ipfs/ipfs/
