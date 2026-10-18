import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sert le site sous https://calurion-dev.github.io/FitQuest/
// En développement on reste à la racine pour garder http://localhost:5173/.
const PAGES_BASE = '/FitQuest/'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

let commit = 'dev'
try {
  commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim()
} catch {
  // Pas un dépôt git (build depuis un export) : on garde 'dev'.
}

export default defineConfig(({ command }) => {
  const base = command === 'build' ? PAGES_BASE : '/'

  return {
    base,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __COMMIT__: JSON.stringify(commit)
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // 'prompt' : on propose « Recharger » dans l'app au lieu de recharger en douce.
        registerType: 'prompt',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'FitQuest — Street Workout RPG',
          short_name: 'FitQuest',
          description:
            'Gamifie ton street workout : XP, niveaux, quêtes, boss et carte des spots.',
          lang: 'fr',
          theme_color: '#0a0a0b',
          background_color: '#0a0a0b',
          display: 'standalone',
          // Relatif au manifest (qui est servi depuis la base) : fonctionne
          // aussi bien sur GitHub Pages que sur un domaine racine.
          start_url: '.',
          scope: '.',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
          ],
          shortcuts: [
            { name: 'Nouvelle séance', url: './#/workout' },
            { name: 'WOD du jour', url: './#/wods' },
            { name: 'Carte des spots', url: './#/map' }
          ]
        },
        workbox: {
          // Les polices Google sont mises en cache : l'app reste belle hors-ligne.
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        }
      })
    ]
  }
})
