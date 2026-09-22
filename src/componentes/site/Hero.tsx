import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useEconomiaDeDados, useMenosMovimento, usePonteiroFino, rolarPara } from '../../hooks/uteis'
import type { Artista, Lancamento } from '../../lib/tipos'
import { usePlayer, type FaixaTocavel } from '../../contextos/Player'
import { Magnetico } from '../ui/Basicos'
import { IconePlay } from '../ui/Icones'

/** Todas as faixas com prévia, na ordem da discografia: vira a "fila" do player. */
export function filaDeFaixas(lancamentos: Lancamento[] | undefined, nome: string): FaixaTocavel[] {
  return (lancamentos ?? []).flatMap((l) =>
    l.faixas.filter((f) => f.urlPrevia).map((f) => ({
      id: `${l.id}-${f.numero}`, titulo: f.titulo, subtitulo: `${nome} · ${l.titulo}`, url: f.urlPrevia!, capa: l.urlCapa,
    })),
  )
}

/**
 * HERO "PALCO": vídeo de fundo + holofote que segue o mouse (no celular ele passeia sozinho)
 * + nome entrando letra por letra + grão de filme.
 */
export function Hero({ artista, lancamentos }: { artista: Artista; lancamentos?: Lancamento[] }) {
  const palco = useRef<HTMLElement>(null)
  const fino = usePonteiroFino()
  const menos = useMenosMovimento()
  const economia = useEconomiaDeDados()
  const player = usePlayer()
  const fila = filaDeFaixas(lancamentos, artista.nomeArtistico)
  const mostrarVideo = artista.urlVideoHero && !menos && !economia

  const moverHolofote = (e: React.PointerEvent) => {
    if (!fino || !palco.current) return
    const r = palco.current.getBoundingClientRect()
    palco.current.style.setProperty('--hx', `${((e.clientX - r.left) / r.width) * 100}%`)
    palco.current.style.setProperty('--hy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  const letras = [...artista.nomeArtistico]
  const tamanhoNome = `clamp(3rem, ${Math.min(20, 125 / Math.max(letras.length, 1))}vw, 15rem)`

  return (
    <section id="inicio" ref={palco} onPointerMove={moverHolofote}
             className="grao relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-white">
      {/* Vídeo (ou pôster) */}
      {mostrarVideo ? (
        <video className="absolute inset-0 -z-20 size-full object-cover opacity-70" src={artista.urlVideoHero!}
               poster={artista.urlPosterHero ?? undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden />
      ) : artista.urlPosterHero ? (
        <img className="absolute inset-0 -z-20 size-full object-cover opacity-70" src={artista.urlPosterHero} alt="" aria-hidden />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,var(--color-superficie),#000)]" aria-hidden />
      )}

      {/* Escurecimento + holofote */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/30 to-fundo" aria-hidden />
      <div className={`holofote absolute inset-0 -z-10 ${fino ? '' : 'holofote-auto'}`} aria-hidden />

      <div className="relative px-4 text-center">
        <motion.p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-secundaria sm:text-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Brega funk · {artista.bairro} · {artista.cidade.split('–')[0].trim()}
        </motion.p>

        {/* Tamanho calculado pelo nº de letras: o nome sempre cabe numa linha só. */}
        {fino && !menos ? (
          // DESKTOP: cada letra entra "pulando", uma de cada vez.
          <h1 className="whitespace-nowrap leading-[0.82] tracking-tight drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              style={{ fontSize: tamanhoNome }} aria-label={artista.nomeArtistico}>
            {letras.map((l, i) => (
              <motion.span key={i} className="inline-block" aria-hidden
                           initial={{ y: '0.35em', rotate: i % 2 ? 10 : -10, scale: 0.9 }}
                           animate={{ y: 0, rotate: 0, scale: 1 }}
                           transition={{ delay: 0.1 + i * 0.05, type: 'spring', damping: 12, stiffness: 160 }}>
                {l === ' ' ? '\u00A0' : l}
              </motion.span>
            ))}
          </h1>
        ) : (
          // CELULAR: o nome é um texto só, animado inteiro. Mais leve para o aparelho e
          // o navegador já considera o título pintado no primeiro quadro (nota de performance).
          <motion.h1 className="whitespace-nowrap leading-[0.82] tracking-tight drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
                     style={{ fontSize: tamanhoNome }}
                     initial={menos ? false : { scale: 0.92, skewX: -6 }} animate={{ scale: 1, skewX: 0 }}
                     transition={{ type: 'spring', damping: 10, stiffness: 120 }}>
            {artista.nomeArtistico}
          </motion.h1>
        )}

        {artista.fraseDeImpacto && (
          <motion.p className="mt-4 font-display text-2xl uppercase text-white/90 sm:text-4xl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + letras.length * 0.06 + 0.2 }}>
            {artista.fraseDeImpacto}
          </motion.p>
        )}

        <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Magnetico>
            <button className="botao-primario px-8 py-4 text-base" data-cursor="grande"
                    onClick={() => { if (fila[0]) player.tocar(fila[0], fila); rolarPara('discografia') }}>
              <IconePlay /> Ouça agora
            </button>
          </Magnetico>
          <Magnetico>
            <button className="botao-contorno px-8 py-4 text-base text-white" data-cursor="grande" onClick={() => rolarPara('clipes')}>
              Assista agora
            </button>
          </Magnetico>
        </motion.div>
      </div>

      <button onClick={() => rolarPara('biografia')} aria-label="Rolar para a biografia"
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
        Role
        <span className="relative h-12 w-px overflow-hidden bg-white/20">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-secundaria" animate={menos ? undefined : { y: ['-100%', '200%'] }}
                       transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </button>
    </section>
  )
}
