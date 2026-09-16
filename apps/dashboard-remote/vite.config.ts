import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [react(), federation({
    name: 'retni_dashboard',
    filename: 'remoteEntry.js',
    exposes: { './Dashboard': './src/Dashboard.tsx', './Mount': './src/mount.tsx' },
    shared: {},
  })],
  server: { port: 4171, cors: true },
  preview: { port: 4171, cors: true },
  build: { target: 'esnext' },
})
