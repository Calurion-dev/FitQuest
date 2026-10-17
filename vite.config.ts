import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sert le site sous https://calurion-dev.github.io/FitQuest/
// En développement on reste à la racine pour garder http://localhost:5173/.
const PAGES_BASE = '/FitQuest/'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? PAGES_BASE : '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'FitQuest — Street Workout RPG',
          short_name: 'FitQuest',
          description:
            'Gamifie ton street workout : XP, niveaux, quêtes, boss et carte des spots.',
          lang: 'fr',
          theme_color: '#0a0e13',
          background_color: '#0a0e13',
          display: 'standalone',
          // Relatif au manifest (qui est servi depuis la base) : fonctionne
          // aussi bien sur GitHub Pages que sur un domaine racine.
          start_url: '.',
          scope: '.',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
          ]
        }
      })
    ]
  }
})
