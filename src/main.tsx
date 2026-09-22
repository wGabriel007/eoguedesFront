import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { rotas } from './app/rotas'
import { PlayerProvider } from './contextos/Player'
// Fontes hospedadas junto com o site (pacotes @fontsource): nada de depender do Google Fonts.
// Mais rápido (sem outra conexão), funciona offline e o Google não recebe o IP de cada fã (LGPD).
// Só o subconjunto "latin" (cobre português). Os arquivos só baixam quando a fonte é usada.
import '@fontsource/anton/latin-400.css'
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-800.css'
import './estilos/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <RouterProvider router={rotas} />
      </PlayerProvider>
    </QueryClientProvider>
  </StrictMode>,
)
