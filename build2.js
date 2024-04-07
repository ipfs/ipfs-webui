// import { analyzeMetafile, build, serve } from 'esbuild';
import { createServer, request, ServerResponse, IncomingMessage } from 'http';
import { relative } from 'path';
import esbuildPkg from 'esbuild';
const { analyzeMetafile, build, serve } = esbuildPkg;
// import { spawn } from 'child_process'

const clients = [];
/**
 * @type {Map<string, string>}
 */
const contentMap = new Map();

const rebuild = (error, result) => {
  contentMap.clear();
  for (const content of result.outputFiles) {
    contentMap.set(relative(".", content.path), content.text);
  }
  clients.forEach((res) => res.write('data: update\n\n'))
  clients.length = 0
  analyzeMetafile(result.metafile)
    .then((text) => {
      console.log(text)
      console.log(error ? error : `Rebuilt at ${new Date().toLocaleString()}`)
    });
}

build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: 'bundle.js',
    write: false,
    incremental: true,
    metafile: true,
    banner: { js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();' },
    watch: {
      onRebuild(error, result) {
        rebuild(error, result)
      },
    },
  })
  .then(result => rebuild(null, result))
  .catch(() => process.exit(1))

serve({ servedir: './' }, {}).then(() => {
  createServer((req, res) => {
    const { url, method, headers } = req;
    const isDir = url.endsWith('/') || url.endsWith('\\');
    const relativeUrl = relative("/", url);
    if (req.url === '/esbuild') {
      return clients.push(
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })
      )
    } else if (contentMap.has(relativeUrl)) {
      res.write(contentMap.get(relativeUrl));
      res.end();
      return;
    }
    const readPath = `${relativeUrl}${isDir ? '/' : ''}`;
    console.log(`Reading: ${readPath}`);
    req.pipe(
      request({ hostname: '0.0.0.0', port: 8000, path: `/${readPath}`, method, headers }, (prxRes) => {
        res.writeHead(prxRes.statusCode || 0, prxRes.headers)
        prxRes.pipe(res, { end: true })
      }),
      { end: true }
    )
  }).listen(3000)

  /* setTimeout(() => {
    const op = { darwin: ['open'], linux: ['xdg-open'], win32: ['cmd', '/c', 'start'] }
    const ptf = process.platform
    if (clients.length === 0) spawn(op[ptf][0], [...[op[ptf].slice(1)], `http://localhost:3000`])
  }, 1000) //open the default browser only if it is not opened yet */
})
