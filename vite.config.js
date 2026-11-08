import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  build: {
    // three.js is only reachable through the lazily-imported ModelViewer, so it
    // already lands in its own chunk. Splitting react out as well keeps the
    // entry chunk small and lets the vendor code cache across deploys.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
        },
      },
    },
    // The 3D chunk is legitimately large; don't fail the eye test on it.
    chunkSizeWarningLimit: 900,
  },
})
