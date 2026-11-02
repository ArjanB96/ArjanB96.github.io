import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' werkt op arjanb96.github.io én in een submap; routing via #hash => geen 404 bij refresh
export default defineConfig({ base: './', plugins: [react()] })
