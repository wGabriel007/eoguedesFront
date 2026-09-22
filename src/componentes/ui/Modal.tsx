import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTravarScroll } from '../../hooks/uteis'
import { IconeFechar } from './Icones'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo?: string
  children: ReactNode
  largura?: string
  /** "claro" usa o fundo de papel (agenda); "escuro" o fundo do tema. */
  variante?: 'escuro' | 'claro' | 'cheio'
}

/**
 * Modal acessível: fecha com Esc e clique fora, trava o scroll da página,
 * devolve o foco para quem abriu e anuncia o título para leitores de tela.
 */
export function Modal({ aberto, aoFechar, titulo, children, largura = 'max-w-2xl', variante = 'escuro' }: Props) {
  const idTitulo = useId()
  const caixa = useRef<HTMLDivElement>(null)
  useTravarScroll(aberto)

  useEffect(() => {
    if (!aberto) return
    const focoAnterior = document.activeElement as HTMLElement | null
    caixa.current?.focus()
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => { window.removeEventListener('keydown', tecla); focoAnterior?.focus?.() }
  }, [aberto, aoFechar])

  const cores = variante === 'claro' ? 'bg-claro text-sobre-claro' : variante === 'cheio' ? 'bg-black text-white' : 'bg-superficie text-texto'

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}
          data-lenis-prevent
        >
          <motion.div
            ref={caixa}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titulo ? idTitulo : undefined}
            tabIndex={-1}
            className={`relative max-h-[92dvh] w-full ${largura} overflow-y-auto rounded-t-3xl p-6 shadow-2xl outline-none sm:rounded-3xl sm:p-8 ${cores}`}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          >
            <button
              onClick={aoFechar}
              aria-label="Fechar"
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-current/10 transition hover:bg-current/20"
            >
              <IconeFechar />
            </button>
            {titulo && <h2 id={idTitulo} className="mb-6 pr-12 text-4xl sm:text-5xl">{titulo}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
