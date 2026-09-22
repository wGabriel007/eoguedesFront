import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Em dev, o Vite repassa /api, /midias e /saude para a API .NET.
// Assim o front chama "/api/shows" sem se preocupar com CORS nem porta.
const API = process.env.VITE_API_PROXY ?? 'http://localhost:5080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        host: true,
        proxy: { '/api': API, '/midias': API, '/saude': API },
        watch: { ignored: ['**/.vs/**', '**/.vscode/**', '**/.idea/**', '**/bin/**', '**/obj/**'] },
    },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Bibliotecas em arquivos separados: mudam pouco, ficam em cache no navegador do fã
        // mesmo quando o código do site é atualizado.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'animacoes'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react'
          if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) return 'formularios'
          return 'bibliotecas'
        },
      },
    },
  },
})
