import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const publicDir = 'frontend/.output/public'
const manifestPath = 'frontend/.output/server/chunks/build/client.precomputed.mjs'
const buildPath = join(publicDir, '_nuxt/builds/latest.json')
const indexPath = join(publicDir, 'index.html')

if (!existsSync(manifestPath)) {
  throw new Error(`Nuxt client manifest was not found at ${manifestPath}`)
}

const manifest = readFileSync(manifestPath, 'utf8')
const entryMatch = manifest.match(/file:"([^"]+)",name:"entry"[\s\S]*?css:\["([^"]+)"\]/)

if (!entryMatch) {
  throw new Error('Could not locate Nuxt entry assets in client manifest.')
}

const [, entryScript, entryCss] = entryMatch
const build = existsSync(buildPath)
  ? JSON.parse(readFileSync(buildPath, 'utf8'))
  : { id: 'production' }

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Календарное бронирование встреч по API-контракту.">
  <title>Calendar</title>
  <link rel="stylesheet" href="/_nuxt/${entryCss}">
</head>
<body>
  <div id="__nuxt"></div>
  <script>
    window.__NUXT__ = {
      serverRendered: false,
      config: {
        public: { apiBase: "" },
        app: {
          baseURL: "/",
          buildAssetsDir: "/_nuxt/",
          cdnURL: ""
        }
      },
      appConfig: {},
      buildId: ${JSON.stringify(build.id)}
    }
  </script>
  <script type="module" src="/_nuxt/${entryScript}"></script>
</body>
</html>
`

writeFileSync(indexPath, html)
