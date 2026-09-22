import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMenosMovimento, usePonteiroFino } from '../../hooks/uteis'
import { linkWhatsApp } from '../../lib/formatos'
import { IconeSeta, IconeWhatsApp } from '../ui/Icones'

/**
 * Faixa de texto infinita, inclinada, estilo fita de "não ultrapasse".
 * Duas faixas cruzadas, correndo em sentidos opostos.
 */
export function FaixaDiagonal({ frases }: { frases: string[] }) {
  const itens = frases.length ? frases : ['brega funk']
  const linha = (reverso: boolean) => (
    <div className={`flex w-max gap-8 whitespace-nowrap py-3 font-display text-2xl uppercase sm:text-4xl ${reverso ? 'animate-marquee-reverso' : 'animate-marquee'}`}>
      {[0, 1].map((k) => (
        <span key={k} className="flex gap-8" aria-hidden={k === 1}>
          {itens.concat(itens).map((f, i) => <span key={i} className="flex items-center gap-8">{f}<span aria-hidden>✦</span></span>)}
        </span>
      ))}
    </div>
  )
  return (
    <div className="relative z-10 -my-10 h-32 overflow-hidden sm:h-40" aria-label={itens.join(', ')}>
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 rotate-[-4deg] bg-secundaria text-sobre-secundaria shadow-xl">{linha(false)}</div>
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 rotate-[3deg] bg-primaria text-sobre-primaria opacity-95 shadow-xl">{linha(true)}</div>
    </div>
  )
}

/** Cursor personalizado: círculo que segue o mouse e cresce sobre links e botões. */
export function CursorPersonalizado() {
  const fino = usePonteiroFino()
  const menos = useMenosMovimento()
  const x = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.4 })
  const y = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.4 })
  const [modo, setModo] = useState<'normal' | 'link' | 'grande' | 'escondido'>('normal')

  useEffect(() => {
    if (!fino || menos) return
    document.documentElement.classList.add('cursor-personalizado')
    const mover = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY)
      const alvo = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], input, textarea, select, label')
      if (!alvo) return setModo('normal')
      if (alvo.matches('input, textarea, select')) return setModo('escondido')
      setModo(alvo.dataset.cursor === 'grande' ? 'grande' : 'link')
    }
    const sair = () => setModo('escondido')
    window.addEventListener('pointermove', mover)
    document.addEventListener('pointerleave', sair)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', sair)
      document.documentElement.classList.remove('cursor-personalizado')
    }
  }, [fino, menos, x, y])

  if (!fino || menos) return null
  const tamanho = { normal: 14, link: 48, grande: 88, escondido: 0 }[modo]
  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full bg-white mix-blend-difference"
                style={{ x, y, translateX: '-50%', translateY: '-50%' }}
                animate={{ width: tamanho, height: tamanho }} transition={{ type: 'spring', stiffness: 400, damping: 28 }} />
  )
}

/** Botão flutuante do WhatsApp + voltar ao topo. Sobem quando o player aparece. */
export function BotoesFlutuantes({ whatsApp, nome, playerAberto }: { whatsApp: string | null; nome: string; playerAberto: boolean }) {
  const [mostrarTopo, setMostrarTopo] = useState(false)
  useEffect(() => {
    const f = () => setMostrarTopo(window.scrollY > window.innerHeight)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <div className={`fixed right-4 z-40 flex flex-col items-end gap-3 transition-all duration-500 sm:right-6 ${playerAberto ? 'bottom-28 sm:bottom-28' : 'bottom-4 sm:bottom-6'}`}>
      <AnimatePresence>
        {mostrarTopo && (
          <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao topo"
                         className="grid size-11 place-items-center rounded-full bg-superficie text-texto shadow-lg ring-1 ring-white/10">
            <IconeSeta className="-rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>
      {whatsApp && (
        <a href={linkWhatsApp(whatsApp, `Olá, ${nome}! Vim pelo site.`)} target="_blank" rel="noopener noreferrer"
           aria-label="Falar no WhatsApp" data-cursor="grande"
           className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40 transition hover:scale-110">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" aria-hidden />
          <IconeWhatsApp width={28} height={28} />
        </a>
      )}
    </div>
  )
}
