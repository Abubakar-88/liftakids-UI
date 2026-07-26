import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lift A Kid',
        short_name: 'Lift A Kid',
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
      },
      // ✅ শুধু এই ৩টি line যোগ করলেই কাজ হবে
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/index-*.js', '**/*.map']
      }
    })
  ],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd'],
          'icons-vendor': ['react-icons'],
          'axios-vendor': ['axios'],
          'quill-vendor': ['react-quill-new']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser'
  }
})