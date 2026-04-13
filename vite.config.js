import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: null, // We register manually in main.js for full control

      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],

      manifest: {
        name: 'Yug Homeschool',
        short_name: 'Yug Homeschool',
        description: 'Manage your homeschooling easily with Yug Homeschool.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        // FIX: Added start_url scoped to the GitHub Pages base path.
        // Without this, installed PWA tries to open '/' which returns 404 on GH Pages.
        start_url: '/HomeShoolAppVue/',
        scope: '/HomeShoolAppVue/',
        // FIX: display_override gives progressive enhancement:
        // tries window-controls-overlay first (desktop PWA titlebar), then standalone
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            // FIX: Added maskable purpose variant for Android adaptive icon support.
            // Without this, Android shows a white square around the icon.
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      // FIX: Enable SW in Vite dev server so caching/offline logic can be tested
      // without a production build. Uses a no-op SW in dev that just activates.
      devOptions: {
        enabled: true,
        type: 'module', // Required for ES module SW (matches our import statements)
      },

      // Workbox injectManifest config: tell it how to resolve assets for precaching
      injectManifestConfig: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    })
  ],
  base: '/HomeShoolAppVue/',
  build: {
    rollupOptions: {
      output: {
        // FIX: Replaced deprecated inlineDynamicImports with modern codeSplitting option
        codeSplitting: false
      }
    }
  }
})
