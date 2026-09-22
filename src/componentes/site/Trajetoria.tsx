import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { useTrajetoria } from '../../lib/consultas'
import type { Artista } from '../../lib/tipos'
import { ImagemProgressiva, TituloSecao } from '../ui/Basicos'

/**
 * #dobairropropalco: a alma do site.
 * Linha do tempo vertical; a linha central "enche" conforme a pessoa rola,
 * e cada marco entra pelo lado dele.
 */
export function Trajetoria({ artista }: { artista: Artista }) {
  const { data: marcos = [] } = useTrajetoria()
  const trilho = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trilho, offset: ['start 70%', 'end 60%'] })
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  if (marcos.length === 0) return null

  return (
    <section id="dobairropropalco" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <TituloSecao subtitulo={`Do ${artista.bairro} para os palcos: os momentos que fizeram ${artista.nomeArtistico}.`}>
          dobairropropalco
        </TituloSecao>

        <div ref={trilho} className="relative mt-16">
          {/* trilho de fundo + trilho que enche */}
          <div className="absolute bottom-0 left-5 top-0 w-1 rounded bg-current/10 md:left-1/2 md:-translate-x-1/2" aria-hidden />
          <motion.div className="absolute bottom-0 left-5 top-0 w-1 origin-top rounded bg-gradient-to-b from-primaria to-secundaria md:left-1/2 md:-translate-x-1/2"
                      style={{ scaleY: progresso }} aria-hidden />

          <ol className="space-y-16 md:space-y-24">
            {marcos.map((m, i) => {
              const direita = i % 2 === 1
              return (
                <li key={m.id} className="relative grid gap-6 pl-14 md:grid-cols-2 md:gap-16 md:pl-0">
                  {/* ponto na linha */}
                  <span className="absolute left-5 top-3 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-fundo ring-4 ring-primaria md:left-1/2" aria-hidden>
                    <span className="size-2 rounded-full bg-secundaria" />
                  </span>

                  <motion.div className={`${direita ? 'md:order-2 md:pl-4' : 'md:pr-4 md:text-right'}`}
                              initial={{ opacity: 0, x: direita ? 60 : -60 }} whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    <p className="texto-contorno font-display text-7xl leading-none text-primaria sm:text-8xl">{m.ano}</p>
                    <h3 className="mt-2 text-3xl sm:text-4xl">{m.titulo}</h3>
                    <p className="mt-3 text-base leading-relaxed text-texto/75 sm:text-lg">{m.descricao}</p>
                  </motion.div>

                  {m.urlFoto && (
                    <motion.div className={direita ? 'md:order-1 md:pr-4' : 'md:pl-4'}
                                initial={{ opacity: 0, scale: 0.9, rotate: direita ? -3 : 3 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: direita ? -1.5 : 1.5 }}
                                viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.9, delay: 0.1 }}>
                      <ImagemProgressiva src={m.urlFoto} alt={m.titulo} className="aspect-[4/3] rounded-2xl shadow-2xl ring-1 ring-white/10" />
                    </motion.div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
