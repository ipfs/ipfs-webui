var cmd = require('comandante')
var fs = require('fs')
var _ = require('lodash')
var Q = require('kew')
var sink = require('stream-sink')
var read = require('recursive-readdir')

var DefaultApps = {}
var Cached = {}

try {
  Cached = JSON.parse(fs.readFileSync('.modified', 'utf-8'))
} catch (e) {}

try {
  DefaultApps = JSON.parse(fs.readFileSync('dist/default_apps.json', 'utf-8'))
} catch (e) {}

var run = function (command, opts) {
  console.log('$ ' + command)

  var split = command.split(' ')
  return cmd(split[0], split.slice(1), opts)
}

var latestChange = function (path, cb) {
  read(path, ['node_modules'], function (err, files) {
    if (err) throw err
    var latest = 0
    _.forEach(files, function (file) {
      var change = fs.statSync(file).mtime.getTime()
      if (change > latest) {
        latest = change
      }
    })
    cb(latest)
  })
}

run('ls apps').pipe(sink()).on('data', function (appdirs) {
  var apps = _.filter(appdirs.split('\n'), function (x) { return x })

  Q.all(_.map(apps, function (appdir) {
    var def = Q.defer()
    var path = process.cwd() + '/apps/' + appdir

    latestChange(path, function (latestchange) {
      if (!Cached[path] || (Cached[path] < latestchange)) {
        run('ipfs-web-app publish', {cwd: path})
          .on('data', function (str) {
            var match = (str + '').match(/app published as (.*)/)
            if (match) {
              var conf = JSON.parse(fs.readFileSync(path + '/package.json'))

              DefaultApps[conf['ipfs-web-app'].displayname] = {
                icon: conf['ipfs-web-app'].icon,
                hash: match[1]
              }
              Cached[path] = (new Date()).getTime()
              def.resolve()
            }
          })
      } else {
        def.resolve()
      }
    })
    return def.promise
  })).then(function (result) {
    console.log('done')
    fs.writeFileSync('.modified', JSON.stringify(Cached) + '\n')
    fs.writeFileSync('dist/default_apps.json', JSON.stringify(DefaultApps) + '\n')
  })
})
