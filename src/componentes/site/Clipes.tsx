import useEmblaCarousel from 'embla-carousel-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import { usePlayer } from '../../contextos/Player'
import { useMenosMovimento, usePonteiroFino } from '../../hooks/uteis'
import { useVideos } from '../../lib/consultas'
import type { Artista, Video } from '../../lib/tipos'
import { Carregando, TituloSecao } from '../ui/Basicos'
import { IconePlay, IconeSeta } from '../ui/Icones'
import { Modal } from '../ui/Modal'

/** Cartão com inclinação 3D que acompanha o mouse. */
function CartaoClipe({ video, aoAbrir }: { video: Video; aoAbrir: () => void }) {
  const fino = usePonteiroFino()
  const menos = useMenosMovimento()
  const mx = useMotionValue(0.5), my = useMotionValue(0.5)
  const rotX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 20 })
  const rotY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 20 })
  const ativo = fino && !menos

  return (
    <div className="[perspective:1000px]">
      <motion.button
        onClick={aoAbrir} data-cursor="grande" aria-label={`Assistir ${video.titulo}`}
        className="group relative block w-full overflow-hidden rounded-2xl bg-black text-left shadow-2xl"
        style={ativo ? { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' } : undefined}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height)
        }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5) }}
      >
        <div className="relative aspect-video">
          {video.urlCapa
            ? <img src={video.urlCapa} alt="" loading="lazy" className="size-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
            : <div className="size-full bg-gradient-to-br from-primaria/40 to-secundaria/30" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primaria text-sobre-primaria shadow-xl transition group-hover:scale-110 sm:size-20"
                style={ativo ? { transform: 'translate(-50%,-50%) translateZ(40px)' } : undefined}>
            <IconePlay width={28} height={28} />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            {video.destaque && <span className="mb-2 inline-block rounded-full bg-secundaria px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sobre-secundaria">Lançamento</span>}
            <p className="font-display text-2xl uppercase leading-tight sm:text-3xl">{video.titulo}</p>
          </div>
        </div>
      </motion.button>
    </div>
  )
}

export function Clipes({ artista }: { artista: Artista }) {
  const { data: videos = [], isLoading } = useVideos()
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start' })
  const [aberto, setAberto] = useState<Video | null>(null)
  const player = usePlayer()

  const abrir = (v: Video) => {
    if (player.tocando) player.alternar() // pausa a música para o clipe tocar
    setAberto(v)
  }

  return (
    <section id="clipes" className="relative isolate overflow-hidden bg-claro py-24 text-sobre-claro sm:py-32">
      <div className="absolute -left-[30vw] top-0 -z-10 hidden h-full w-[60vw] rounded-r-full bg-sobre-claro lg:block" aria-hidden />
      {artista.urlRecorteArtista && (
        <motion.img src={artista.urlRecorteArtista} alt="" aria-hidden
                    className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[85%] max-w-[28vw] -scale-x-100 object-contain object-bottom lg:block"
                    initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:pl-[26vw]">
        <div className="flex items-end justify-between gap-4">
          <TituloSecao>clipes</TituloSecao>
          {videos.length > 2 && (
            <div className="mb-10 hidden gap-2 sm:flex">
              <button onClick={() => embla?.scrollPrev()} aria-label="Anterior" className="grid size-12 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta className="rotate-180" /></button>
              <button onClick={() => embla?.scrollNext()} aria-label="Próximo" className="grid size-12 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta /></button>
            </div>
          )}
        </div>
        {isLoading ? <Carregando /> : videos.length === 0 ? (
          <p className="opacity-70">Clipes chegando em breve.</p>
        ) : (
          <div className="overflow-hidden p-2" ref={emblaRef}>
            <div className="flex gap-6">
              {videos.map((v) => (
                <div key={v.id} className="min-w-0 shrink-0 basis-[88%] sm:basis-[60%] lg:basis-[48%]">
                  <CartaoClipe video={v} aoAbrir={() => abrir(v)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal aberto={!!aberto} aoFechar={() => setAberto(null)} largura="max-w-5xl" variante="cheio">
        {aberto && (
          <div>
            <p className="mb-4 pr-12 font-display text-2xl uppercase sm:text-3xl">{aberto.titulo}</p>
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              {aberto.tipo === 'YouTube' && aberto.youTubeId ? (
                // youtube-nocookie: o YouTube não grava cookies até a pessoa dar play
                <iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${aberto.youTubeId}?autoplay=1&rel=0`}
                        title={aberto.titulo} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : (
                <video className="size-full" src={aberto.url ?? undefined} poster={aberto.urlCapa ?? undefined} controls autoPlay playsInline />
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
