var i18n = require('i18next-client');

i18n.init({
  lngWhiteList: ['en', 'cs', 'de'],
  fallbackLng: 'en',
  resGetPath: '/static/locale/webui-%{lng}.json',
  interpolationPrefix: '%{',
  interpolationSuffix: '}',
  keyseparator: '<',
  nsseparator: '>'
});

module.exports = i18n;
