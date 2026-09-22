import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { usePlayer } from '../../contextos/Player'
import { useMenosMovimento } from '../../hooks/uteis'
import { duracao } from '../../lib/formatos'
import { IconeAnterior, IconeFechar, IconePausa, IconePlay, IconeProxima } from '../ui/Icones'

/**
 * Barras que dançam com a música. Lê as frequências do AnalyserNode
 * 60x por segundo e desenha num <canvas> (bem mais leve que animar divs).
 */
export function Visualizador({ className = '', barras = 24 }: { className?: string; barras?: number }) {
  const { analisador, tocando } = usePlayer()
  const menos = useMenosMovimento()
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const dados = new Uint8Array(analisador?.frequencyBinCount ?? 64)
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--color-primaria').trim() || '#ff2d95'
    const cor2 = getComputedStyle(document.documentElement).getPropertyValue('--color-secundaria').trim() || '#c6ff00'
    let raf = 0
    let t = 0

    const desenhar = () => {
      const dpr = window.devicePixelRatio || 1
      const w = c.clientWidth * dpr, h = c.clientHeight * dpr
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
      ctx.clearRect(0, 0, w, h)
      if (analisador && tocando) analisador.getByteFrequencyData(dados)
      t += 0.05
      const largura = w / barras
      const grad = ctx.createLinearGradient(0, h, 0, 0)
      grad.addColorStop(0, cor); grad.addColorStop(1, cor2)
      ctx.fillStyle = grad
      for (let i = 0; i < barras; i++) {
        // Sem analisador (ou pausado): uma "respiração" suave em vez de barras paradas.
        const bruto = analisador && tocando
          ? dados[Math.floor((i / barras) * dados.length * 0.75)] / 255
          : tocando ? 0.3 + 0.25 * Math.sin(t * 3 + i * 0.6) : 0.08
        const altura = Math.max(2 * dpr, bruto * h)
        ctx.beginPath()
        ctx.roundRect(i * largura + largura * 0.18, h - altura, largura * 0.64, altura, 2 * dpr)
        ctx.fill()
      }
      if (!menos) raf = requestAnimationFrame(desenhar)
    }
    desenhar()
    return () => cancelAnimationFrame(raf)
  }, [analisador, tocando, barras, menos])

  return <canvas ref={canvas} className={className} aria-hidden />
}

export function MiniPlayer() {
  const p = usePlayer()
  const barra = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {p.atual && (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl overflow-hidden rounded-2xl bg-black/85 text-white shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl"
          initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
          role="region" aria-label="Player de música"
        >
          <Visualizador className="pointer-events-none absolute inset-0 size-full opacity-25" barras={48} />
          <div className="relative flex items-center gap-3 p-2.5 pr-3">
            <img src={p.atual.capa} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.atual.titulo}</p>
              <p className="truncate text-xs text-white/60">{p.atual.subtitulo}</p>
            </div>
            <Visualizador className="hidden h-8 w-20 sm:block" barras={12} />
            <div className="flex items-center gap-1">
              {p.fila.length > 1 && <button onClick={p.anterior} aria-label="Faixa anterior" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><IconeAnterior width={16} /></button>}
              <button onClick={p.alternar} aria-label={p.tocando ? 'Pausar' : 'Tocar'}
                      className="grid size-11 place-items-center rounded-full bg-primaria text-sobre-primaria transition hover:scale-105">
                {p.tocando ? <IconePausa /> : <IconePlay />}
              </button>
              {p.fila.length > 1 && <button onClick={p.proxima} aria-label="Próxima faixa" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><IconeProxima width={16} /></button>}
              <button onClick={p.fechar} aria-label="Fechar player" className="grid size-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><IconeFechar width={16} /></button>
            </div>
          </div>
          {/* Barra de progresso clicável */}
          <div ref={barra} role="slider" aria-label="Posição da música" aria-valuemin={0} aria-valuemax={100}
               aria-valuenow={Math.round(p.progresso * 100)} aria-valuetext={`${duracao(p.progresso * p.duracao)} de ${duracao(p.duracao)}`}
               tabIndex={0}
               onKeyDown={(e) => {
                 if (e.key === 'ArrowRight') p.buscar(Math.min(1, p.progresso + 0.05))
                 if (e.key === 'ArrowLeft') p.buscar(Math.max(0, p.progresso - 0.05))
               }}
               onClick={(e) => { const r = barra.current!.getBoundingClientRect(); p.buscar((e.clientX - r.left) / r.width) }}
               className="relative h-1.5 cursor-pointer bg-white/10">
            <div className="h-full bg-gradient-to-r from-primaria to-secundaria" style={{ width: `${p.progresso * 100}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
