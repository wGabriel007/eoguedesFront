import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTravarScroll } from '../../hooks/uteis'
import { useFotos } from '../../lib/consultas'
import { CATEGORIAS_FOTO, type CategoriaFoto, type Foto } from '../../lib/tipos'
import { Carregando, TituloSecao } from '../ui/Basicos'
import { IconeFechar, IconeSeta } from '../ui/Icones'

const ROTULOS: Record<CategoriaFoto, string> = { Show: 'Shows', Ensaio: 'Ensaios', Bastidores: 'Bastidores', Bairro: 'O bairro' }

/** Tela cheia: setas no desktop, arrastar para o lado no celular, Esc para fechar. */
function Lightbox({ fotos, indice, setIndice }: { fotos: Foto[]; indice: number | null; setIndice: (i: number | null) => void }) {
  const [direcao, setDirecao] = useState(0)
  useTravarScroll(indice !== null)
  const ir = useCallback((passo: number) => {
    if (indice === null) return
    setDirecao(passo)
    setIndice((indice + passo + fotos.length) % fotos.length)
  }, [indice, fotos.length, setIndice])

  useEffect(() => {
    if (indice === null) return
    const t = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndice(null)
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', t)
    return () => window.removeEventListener('keydown', t)
  }, [indice, ir, setIndice])

  const foto = indice !== null ? fotos[indice] : null
  const aoSoltar = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) ir(1)
    else if (info.offset.x > 80 || info.velocity.x > 400) ir(-1)
  }

  return createPortal(
    <AnimatePresence>
      {foto && (
        <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95" role="dialog" aria-modal="true"
                    aria-label={foto.legenda ?? 'Foto'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
          <AnimatePresence initial={false} custom={direcao} mode="popLayout">
            <motion.img key={foto.id} src={foto.url} alt={foto.legenda ?? ''} custom={direcao}
                        className="max-h-[86dvh] max-w-[94vw] select-none rounded-lg object-contain shadow-2xl"
                        style={{ backgroundImage: `url(${foto.urlMiniatura})`, backgroundSize: 'cover' }}
                        initial={{ opacity: 0, x: direcao * 120 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direcao * -120 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={aoSoltar} draggable={false} />
          </AnimatePresence>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="text-sm tabular-nums opacity-70">{(indice ?? 0) + 1} / {fotos.length}</span>
            <button onClick={() => setIndice(null)} aria-label="Fechar" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><IconeFechar /></button>
          </div>
          {foto.legenda && <p className="absolute inset-x-0 bottom-6 text-center text-sm text-white/80">{foto.legenda}</p>}
          <button onClick={() => ir(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"><IconeSeta className="rotate-180" /></button>
          <button onClick={() => ir(1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"><IconeSeta /></button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Galeria() {
  const { data: todas = [], isLoading } = useFotos()
  const [filtro, setFiltro] = useState<CategoriaFoto | null>(null)
  const [indice, setIndice] = useState<number | null>(null)
  const fotos = filtro ? todas.filter((f) => f.categoria === filtro) : todas
  const categorias = CATEGORIAS_FOTO.filter((c) => todas.some((f) => f.categoria === c))

  if (!isLoading && todas.length === 0) return null

  return (
    <section id="galeria" className="bg-fundo py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <TituloSecao>fotos</TituloSecao>
        <div className="sem-barra -mx-4 mb-8 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar fotos">
          {[null, ...categorias].map((c) => (
            <button key={c ?? 'todas'} onClick={() => setFiltro(c)} aria-pressed={filtro === c}
                    className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold ring-1 ring-current/20 transition aria-pressed:bg-primaria aria-pressed:text-sobre-primaria aria-pressed:ring-primaria">
              {c ? ROTULOS[c] : 'Todas'}
            </button>
          ))}
        </div>

        {isLoading ? <Carregando /> : (
          // Mosaico com CSS columns: as fotos se encaixam pela altura de cada uma.
          <motion.ul layout className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
            <AnimatePresence mode="popLayout">
              {fotos.map((f, i) => (
                <motion.li key={f.id} layout className="mb-3 break-inside-avoid sm:mb-4"
                           initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <button onClick={() => setIndice(i)} className="group relative block w-full overflow-hidden rounded-xl" data-cursor="grande"
                          aria-label={`Ampliar foto${f.legenda ? `: ${f.legenda}` : ''}`}>
                    <span className="block bg-superficie bg-cover bg-center" style={{ aspectRatio: `${f.largura} / ${f.altura}`, backgroundImage: `url(${f.urlMiniatura})` }}>
                      <img src={f.urlMiniatura === f.url ? f.url : f.urlMiniatura} alt={f.legenda ?? ''} loading="lazy" decoding="async"
                           width={f.largura} height={f.altura}
                           className="size-full object-cover transition duration-700 group-hover:scale-105" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
      <Lightbox fotos={fotos} indice={indice} setIndice={setIndice} />
    </section>
  )
}
