import { lazy, Suspense, useEffect } from 'react'
import { Agenda } from '../componentes/site/Agenda'
import { Biografia } from '../componentes/site/Biografia'
import { Cabecalho } from '../componentes/site/Cabecalho'
import { Discografia } from '../componentes/site/Discografia'
import { BotoesFlutuantes, CursorPersonalizado, FaixaDiagonal } from '../componentes/site/Efeitos'
import { Hero } from '../componentes/site/Hero'
import { MiniPlayer } from '../componentes/site/MiniPlayer'
import { Seo } from '../componentes/site/Seo'
import { Trajetoria } from '../componentes/site/Trajetoria'
import { usePlayer } from '../contextos/Player'
import { useMenosMovimento, useScrollSuave } from '../hooks/uteis'
import { useArtista, useLancamentos, useShows } from '../lib/consultas'
import { aplicarTema, type FonteId, type TemaId } from '../lib/tema'

// Seções do fim da página: baixadas em paralelo, sem atrasar o primeiro desenho da tela.
// (Os formulários e a biblioteca de validação só chegam aqui.)
const Clipes = lazy(() => import('../componentes/site/Clipes').then((m) => ({ default: m.Clipes })))
const Galeria = lazy(() => import('../componentes/site/Galeria').then((m) => ({ default: m.Galeria })))
const Mural = lazy(() => import('../componentes/site/Mural').then((m) => ({ default: m.Mural })))
const Contrate = lazy(() => import('../componentes/site/Contrate').then((m) => ({ default: m.Contrate })))
const Contato = lazy(() => import('../componentes/site/Contato').then((m) => ({ default: m.Contato })))
const Rodape = lazy(() => import('../componentes/site/Contato').then((m) => ({ default: m.Rodape })))

export default function Inicio() {
  const { data: artista, isError, refetch } = useArtista()
  const { data: lancamentos } = useLancamentos()
  const { data: shows } = useShows('proximos')
  const player = usePlayer()
  const menos = useMenosMovimento()
  useScrollSuave(!menos)

  // O tema escolhido no painel vale para o site inteiro.
  useEffect(() => {
    if (artista) aplicarTema(artista.tema as TemaId, artista.fonte as FonteId)
  }, [artista])

  if (isError) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="font-display text-5xl uppercase">Sem sinal</p>
          <p className="mt-2 opacity-70">Não conseguimos carregar o site agora.</p>
          <button onClick={() => refetch()} className="botao-primario mt-6">Tentar de novo</button>
        </div>
      </main>
    )
  }

  if (!artista) {
    return (
      <main className="grid min-h-dvh place-items-center bg-black" aria-busy="true">
        <span className="flex h-10 items-end gap-1" aria-label="Carregando">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-1.5 animate-pulse rounded-full bg-primaria" style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${i * 110}ms` }} />
          ))}
        </span>
      </main>
    )
  }

  const nomesFaixas = (lancamentos ?? []).flatMap((l) => l.faixas.map((f) => f.titulo)).slice(0, 6)
  const frases = [
    artista.fraseDeImpacto ?? 'Do bairro pro palco',
    `#${artista.bairro.replace(/\s/g, '').toLowerCase()}`,
    ...nomesFaixas,
    'brega funk',
  ]

  return (
    <>
      <a href="#biografia" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-primaria focus:px-4 focus:py-2 focus:text-sobre-primaria">
        Pular para o conteúdo
      </a>
      <Seo artista={artista} shows={shows} lancamentos={lancamentos} />
      <CursorPersonalizado />
      <Cabecalho artista={artista} />
      <main>
        <Hero artista={artista} lancamentos={lancamentos} />
        <Biografia artista={artista} />
        <FaixaDiagonal frases={frases} />
        <Trajetoria artista={artista} />
        <Agenda />
        <Discografia artista={artista} />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Clipes artista={artista} />
          <Galeria />
          <FaixaDiagonal frases={frases.slice().reverse()} />
          <Mural />
          <Contrate artista={artista} />
          <Contato artista={artista} />
        </Suspense>
      </main>
      <Suspense fallback={null}><Rodape artista={artista} /></Suspense>
      <MiniPlayer />
      <BotoesFlutuantes whatsApp={artista.whatsApp} nome={artista.nomeArtistico} playerAberto={!!player.atual} />
    </>
  )
}
