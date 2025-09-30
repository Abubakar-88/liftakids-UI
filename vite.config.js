import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
 VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lift A Kids',
        short_name: 'Lift A Kids',
        description: 'Student Management System',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/liftakdis.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/liftakdis.svg',
            sizes: '512x512', 
            type: 'image/svg+xml'
          }
        ]
      }
    })

  ],
})
