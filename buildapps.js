var cmd = require('comandante')
var fs = require('fs')
var _ = require('lodash')
var Q = require('kew')
var sink = require('stream-sink')
var read = require('recursive-readdir')

var DefaultApps = []
var Cached = {}

try {
  Cached = JSON.parse(fs.readFileSync('.modified', 'utf-8'))
} catch (e) {}

try {
  DefaultApps = JSON.parse(fs.readFileSync('dist/default_apps.json', 'utf-8'))
} catch (e) {}

var run = function (command, opts, cb) {
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

var update = function (apps, app) {
  for (var i = 0 ; i < apps.length ; i++) {
    if (apps[i].displayname === app.displayname) {
      apps[i] = app
      return
    }
  }
  apps.push(app)
}

run('ls apps').pipe(sink()).on('data', function (appdirs) {
  var apps = _.filter(appdirs.split('\n'), function (x) { return x })

  Q.all(_.map(apps, function (appdir) {
    var def = Q.defer()
    var relative = 'apps/' + appdir
    var path = process.cwd() + '/' + relative

    latestChange(path, function (latestchange) {
      if (!Cached[path] || (Cached[path] < latestchange)) {
        run('ipfs-web-app publish', {cwd: path})
          .on('data', function (str) {
            var match = (str + '').match(/app published as (.*)/)
            if (match) {
              var conf = JSON.parse(fs.readFileSync(path + '/package.json'))
              var name = conf['ipfs-web-app'].displayname

              update(DefaultApps, {
                icon: conf['ipfs-web-app'].icon,
                sort: conf['ipfs-web-app'].sort,
                displayname: name,
                hash: relative
              })

              Cached[path] = (new Date()).getTime()

              var tmpdir = '/tmp/ipfsapp-' + name
              var destination = 'dist/' + relative

              // copy the app
              run('cp -R ' + path + '/dist ' + tmpdir)
                .once('close', function () {
                  // remove old version
                  run('rm -Rf ' + destination)
                    .once('close', function () {
                      // move the copy
                      run('mv ' + tmpdir + ' ' + destination)
                        .once('close', function () {
                          def.resolve()
                        })
                    })
                })
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

    var sortedApps = _.sortBy(DefaultApps, 'sort')

    fs.writeFileSync('dist/default_apps.json',
                     JSON.stringify(sortedApps) + '\n')
  })
})
