import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Link } from 'react-router-dom'
import Inicio from '../paginas/Inicio'

// O painel é carregado sob demanda: o fã que entra pelo Instagram não baixa o código do admin.
const Admin = lazy(() => import('../paginas/admin/Admin'))

const carregando = <div className="grid min-h-dvh place-items-center text-texto-suave">Carregando…</div>
const comSuspense = (el: ReactNode) => <Suspense fallback={carregando}>{el}</Suspense>

function NaoEncontrado() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="texto-contorno font-display text-[10rem] leading-none text-primaria">404</p>
        <p className="font-display text-4xl uppercase">Essa página saiu do palco</p>
        <Link to="/" className="botao-primario mt-8">Voltar ao início</Link>
      </div>
    </main>
  )
}

export const rotas = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  { path: '/admin/*', element: comSuspense(<Admin />) },
  { path: '*', element: <NaoEncontrado /> },
])
