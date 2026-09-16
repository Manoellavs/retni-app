import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [react(), federation({
    name: 'retni_transactions',
    filename: 'remoteEntry.js',
    exposes: { './Transactions': './src/Transactions.tsx', './Mount': './src/mount.tsx' },
    shared: {},
  })],
  server: { port: 4172, cors: true },
  preview: { port: 4172, cors: true },
  build: { target: 'esnext' },
})
