import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { rolarPara, useTravarScroll } from '../../hooks/uteis'
import type { Artista } from '../../lib/tipos'
import { IconeFechar, IconeMenu, REDES } from '../ui/Icones'

export const SECOES = [
  { id: 'biografia', rotulo: 'Biografia' },
  { id: 'dobairropropalco', rotulo: 'Trajetória' },
  { id: 'agenda', rotulo: 'Agenda' },
  { id: 'discografia', rotulo: 'Discografia' },
  { id: 'clipes', rotulo: 'Clipes' },
  { id: 'galeria', rotulo: 'Fotos' },
  { id: 'contrate', rotulo: 'Contrate' },
  { id: 'contato', rotulo: 'Contato' },
] as const

export function Redes({ artista, className = '' }: { artista?: Artista; className?: string }) {
  if (!artista) return null
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {REDES.map(({ chave, nome, Icone }) => {
        const link = artista.redes[chave]
        if (!link) return null
        return (
          <li key={chave}>
            <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${artista.nomeArtistico} no ${nome}`}
               className="grid size-9 place-items-center rounded-full transition hover:bg-current/10 hover:text-primaria">
              <Icone />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function Cabecalho({ artista }: { artista?: Artista }) {
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [ativa, setAtiva] = useState<string>('')
  useTravarScroll(aberto)

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 40)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Destaca no menu a seção que está na tela.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECOES.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [artista])

  const ir = (id: string) => { setAberto(false); setTimeout(() => rolarPara(id), aberto ? 250 : 0) }
  const nome = artista?.nomeArtistico ?? ''

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${rolou ? 'bg-fundo/80 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6" aria-label="Principal">
          <button onClick={() => ir('inicio')} className="font-display text-2xl uppercase tracking-wide sm:text-3xl" aria-label={`${nome}: voltar ao início`}>
            {nome}
          </button>
          <ul className="hidden items-center gap-1 lg:flex">
            {SECOES.map((s) => (
              <li key={s.id}>
                <button onClick={() => ir(s.id)}
                        className={`relative rounded-full px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.14em] transition hover:text-primaria ${ativa === s.id ? 'text-primaria' : ''}`}>
                  {s.rotulo}
                  {ativa === s.id && <motion.span layoutId="menu-ativo" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-primaria" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Redes artista={artista} className="hidden sm:flex" />
            <button onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto}
                    className="grid size-11 place-items-center rounded-full bg-current/10 lg:hidden">
              <IconeMenu />
            </button>
          </div>
        </nav>
      </header>

      {/* Menu do celular: tela cheia, links gigantes */}
      <AnimatePresence>
        {aberto && (
          <motion.div className="fixed inset-0 z-[60] flex flex-col bg-fundo px-6 pb-8 pt-5 lg:hidden"
                      initial={{ clipPath: 'circle(0% at 95% 4%)' }} animate={{ clipPath: 'circle(150% at 95% 4%)' }}
                      exit={{ clipPath: 'circle(0% at 95% 4%)' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent>
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl uppercase">{nome}</span>
              <button onClick={() => setAberto(false)} aria-label="Fechar menu" className="grid size-11 place-items-center rounded-full bg-current/10"><IconeFechar /></button>
            </div>
            <ul className="mt-8 flex-1 space-y-1 overflow-y-auto">
              {SECOES.map((s, i) => (
                <motion.li key={s.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <button onClick={() => ir(s.id)} className="group flex w-full items-baseline gap-3 py-1 text-left font-display text-5xl uppercase">
                    <span className="text-base text-primaria">{String(i + 1).padStart(2, '0')}</span>
                    <span className="transition group-hover:translate-x-2 group-hover:text-primaria">{s.rotulo}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <Redes artista={artista} className="justify-center" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
