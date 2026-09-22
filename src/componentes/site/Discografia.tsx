import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { usePlayer } from '../../contextos/Player'
import { useLancamentos } from '../../lib/consultas'
import { anoDe, duracao } from '../../lib/formatos'
import { NOMES_PLATAFORMA, type Artista, type Lancamento } from '../../lib/tipos'
import { Carregando, TituloSecao } from '../ui/Basicos'
import { IconePausa, IconePlay, IconeSeta, IconeSpotify, IconeYouTube } from '../ui/Icones'
import { Modal } from '../ui/Modal'
import { filaDeFaixas } from './Hero'

const TIPO: Record<Lancamento['tipo'], string> = { Album: 'Álbum', EP: 'EP', Single: 'Single' }

function DetalheLancamento({ lancamento, artista, todos }: { lancamento: Lancamento; artista: Artista; todos: Lancamento[] }) {
  const player = usePlayer()
  const fila = filaDeFaixas(todos, artista.nomeArtistico)
  return (
    <div className="grid gap-8 sm:grid-cols-[240px_1fr]">
      <img src={lancamento.urlCapa} alt={`Capa de ${lancamento.titulo}`} className="aspect-square w-full rounded-2xl object-cover shadow-2xl" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-secundaria">{TIPO[lancamento.tipo]} · {anoDe(lancamento.dataLancamento)}</p>
        <h3 className="mt-1 text-4xl sm:text-5xl">{lancamento.titulo}</h3>
        <ol className="mt-6 divide-y divide-current/10">
          {lancamento.faixas.map((f) => {
            const id = `${lancamento.id}-${f.numero}`
            const ativa = player.atual?.id === id
            const faixa = fila.find((x) => x.id === id)
            return (
              <li key={f.numero} className={`flex items-center gap-3 py-3 ${ativa ? 'text-primaria' : ''}`}>
                <button disabled={!faixa} onClick={() => faixa && player.tocar(faixa, fila)}
                        aria-label={ativa && player.tocando ? `Pausar ${f.titulo}` : `Tocar prévia de ${f.titulo}`}
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-current/10 transition hover:bg-primaria hover:text-sobre-primaria disabled:opacity-30">
                  {ativa && player.tocando ? <IconePausa width={16} /> : <IconePlay width={16} />}
                </button>
                <span className="w-6 text-sm tabular-nums opacity-50">{f.numero}</span>
                <span className="flex-1 font-semibold">{f.titulo}</span>
                <span className="text-sm tabular-nums opacity-60">{duracao(f.duracaoSegundos)}</span>
              </li>
            )
          })}
        </ol>
        {lancamento.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {lancamento.links.map((l) => (
              <a key={l.plataforma} href={l.url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-full bg-current/10 px-4 py-2 text-sm font-semibold transition hover:bg-primaria hover:text-sobre-primaria">
                {l.plataforma === 'Spotify' ? <IconeSpotify width={16} /> : l.plataforma === 'YouTubeMusic' ? <IconeYouTube width={16} /> : null}
                {NOMES_PLATAFORMA[l.plataforma]}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Discografia({ artista }: { artista: Artista }) {
  const { data: lancamentos = [], isLoading } = useLancamentos()
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', dragFree: true })
  const [aberto, setAberto] = useState<Lancamento | null>(null)
  const player = usePlayer()
  const fila = filaDeFaixas(lancamentos, artista.nomeArtistico)

  return (
    <section id="discografia" className="relative isolate overflow-hidden bg-fundo py-24 sm:py-32">
      {/* forma curva + recorte do artista invadindo a seção (como na referência) */}
      <div className="absolute -right-[30vw] top-0 -z-10 hidden h-full w-[70vw] rounded-l-full bg-superficie lg:block" aria-hidden />
      {artista.urlRecorteArtista && (
        <motion.img src={artista.urlRecorteArtista} alt="" aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-[88%] max-w-[40vw] object-contain object-bottom lg:block"
                    initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <TituloSecao subtitulo="Clique numa capa para ouvir as prévias e abrir nas plataformas.">discografia</TituloSecao>
          <div className="mb-10 hidden gap-2 sm:flex">
            <button onClick={() => embla?.scrollPrev()} aria-label="Anterior" className="grid size-12 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta className="rotate-180" /></button>
            <button onClick={() => embla?.scrollNext()} aria-label="Próximo" className="grid size-12 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeSeta /></button>
          </div>
        </div>

        {isLoading ? <Carregando /> : (
          <div className="overflow-hidden lg:mr-[32vw]" ref={emblaRef}>
            <div className="flex gap-5">
              {lancamentos.map((l, i) => {
                const primeira = fila.find((f) => f.id.startsWith(l.id))
                const tocandoEste = player.atual?.id.startsWith(l.id) && player.tocando
                return (
                  <motion.article key={l.id} className="group relative min-w-0 shrink-0 basis-[72%] sm:basis-[42%] lg:basis-[46%]"
                                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <button onClick={() => setAberto(l)} className="block w-full text-left" data-cursor="grande" aria-label={`Abrir ${l.titulo}`}>
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                        <img src={l.urlCapa} alt={`Capa de ${l.titulo}`} loading="lazy"
                             className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                        {/* disco saindo da capa */}
                        <span className={`absolute inset-y-4 right-4 aspect-square rounded-full bg-[repeating-radial-gradient(circle,#111_0_2px,#1c1c1c_3px_4px)] shadow-xl transition-transform duration-700 ${tocandoEste ? 'translate-x-1/3 animate-spin [animation-duration:3s]' : 'translate-x-0 group-hover:translate-x-1/4'} -z-0 opacity-0 group-hover:opacity-100 ${tocandoEste ? 'opacity-100' : ''}`} aria-hidden />
                      </div>
                    </button>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-secundaria">{TIPO[l.tipo]} · {anoDe(l.dataLancamento)}</p>
                        <h3 className="text-2xl sm:text-3xl">{l.titulo}</h3>
                      </div>
                      {primeira && (
                        <button onClick={() => player.tocar(primeira, fila)} aria-label={`Tocar ${l.titulo}`}
                                className="grid size-12 shrink-0 place-items-center rounded-full bg-primaria text-sobre-primaria shadow-lg transition hover:scale-110">
                          {tocandoEste ? <IconePausa /> : <IconePlay />}
                        </button>
                      )}
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Modal aberto={!!aberto} aoFechar={() => setAberto(null)} largura="max-w-4xl">
        {aberto && <DetalheLancamento lancamento={aberto} artista={artista} todos={lancamentos} />}
      </Modal>
    </section>
  )
}
