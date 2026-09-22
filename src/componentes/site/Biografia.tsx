import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFotos } from '../../lib/consultas'
import type { Artista } from '../../lib/tipos'
import { ImagemProgressiva, TituloSecao } from '../ui/Basicos'
import { IconeSeta } from '../ui/Icones'
import { Modal } from '../ui/Modal'

export function Biografia({ artista }: { artista: Artista }) {
  const { data: fotos = [] } = useFotos()
  const retratos = [...fotos.filter((f) => f.categoria === 'Ensaio'), ...fotos.filter((f) => f.categoria !== 'Ensaio')].slice(0, 8)
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: 'center' })
  const [indice, setIndice] = useState(0)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!embla) return
    const f = () => setIndice(embla.selectedScrollSnap())
    embla.on('select', f)
    // passa sozinho a cada 4s
    const t = setInterval(() => embla.scrollNext(), 4000)
    return () => { embla.off('select', f); clearInterval(t) }
  }, [embla])

  return (
    <section id="biografia" className="relative overflow-hidden bg-superficie py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-20 size-[36rem] rounded-full bg-primaria/10 blur-3xl" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Carrossel de retratos */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {retratos.map((f, i) => (
                <div key={f.id} className="min-w-0 shrink-0 grow-0 basis-[72%] px-2 sm:basis-[58%]">
                  <motion.div animate={{ scale: i === indice ? 1 : 0.86, opacity: i === indice ? 1 : 0.45 }} transition={{ duration: 0.5 }}>
                    <ImagemProgressiva src={f.url} miniatura={f.urlMiniatura} alt={f.legenda ?? `Foto de ${artista.nomeArtistico}`}
                                       className="aspect-[4/5] rounded-2xl shadow-2xl" largura={f.largura} altura={f.altura} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          {retratos.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => embla?.scrollPrev()} aria-label="Foto anterior" className="grid size-11 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta className="rotate-180" /></button>
              <div className="flex">
                {retratos.map((f, i) => (
                  // Área de toque de 24px (acessibilidade), com a "pílula" visível dentro.
                  <button key={f.id} onClick={() => embla?.scrollTo(i)} aria-label={`Ir para a foto ${i + 1}`} aria-current={i === indice}
                          className="grid h-6 min-w-6 place-items-center">
                    <span className={`h-1.5 rounded-full transition-all ${i === indice ? 'w-8 bg-primaria' : 'w-3 bg-current/25'}`} />
                  </button>
                ))}
              </div>
              <button onClick={() => embla?.scrollNext()} aria-label="Próxima foto" className="grid size-11 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta /></button>
            </div>
          )}
        </div>

        {/* Texto */}
        <div>
          <TituloSecao>biografia</TituloSecao>
          <motion.p className="text-lg leading-relaxed text-texto/85 sm:text-xl"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            {artista.bioCurta}
          </motion.p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-current/10 py-6 text-sm">
            <div><dt className="text-texto-suave">De onde vem</dt><dd className="mt-1 font-display text-2xl uppercase">{artista.bairro}</dd></div>
            <div><dt className="text-texto-suave">Cidade</dt><dd className="mt-1 font-display text-2xl uppercase">{artista.cidade}</dd></div>
          </dl>
          <button onClick={() => setAberto(true)} className="botao-primario mt-8" data-cursor="grande">Ver mais <IconeSeta /></button>
        </div>
      </div>

      <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo={artista.nomeArtistico} largura="max-w-3xl">
        <div className="space-y-4 whitespace-pre-line text-lg leading-relaxed text-texto/85">{artista.bioCompleta}</div>
      </Modal>
    </section>
  )
}
