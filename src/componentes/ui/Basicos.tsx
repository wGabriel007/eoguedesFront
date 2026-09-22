import { motion, useMotionValue, useSpring } from 'framer-motion'
import { forwardRef, useId, type ComponentProps, type ReactNode } from 'react'
import { useMenosMovimento, usePonteiroFino } from '../../hooks/uteis'

/** Título de seção em formato de hashtag, como na referência: #agenda */
export function TituloSecao({ children, className = '', subtitulo }: { children: string; className?: string; subtitulo?: string }) {
  return (
    <motion.header
      className={`mb-10 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Palavras longas (#dobairropropalco) ganham fonte menor para caber no celular. */}
      <h2 className="leading-[0.85] [overflow-wrap:anywhere]"
          style={{ fontSize: `clamp(2.25rem, ${Math.min(10, 105 / (children.length + 1))}vw, 7rem)` }}>
        <span className="text-primaria">#</span>{children}
      </h2>
      {subtitulo && <p className="mt-3 max-w-xl text-base opacity-75 sm:text-lg">{subtitulo}</p>}
    </motion.header>
  )
}

/**
 * Botão "magnético": no desktop, ele é puxado levemente na direção do mouse.
 * No celular (ou com menos movimento) é um botão/link normal.
 */
export function Magnetico({ children, forca = 0.35, className = '' }: { children: ReactNode; forca?: number; className?: string }) {
  const fino = usePonteiroFino()
  const menos = useMenosMovimento()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 })
  if (!fino || menos) return <span className={`inline-flex ${className}`}>{children}</span>
  return (
    <motion.span
      className={`inline-flex ${className}`}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * forca)
        y.set((e.clientY - r.top - r.height / 2) * forca)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.span>
  )
}

/** Campo de formulário com rótulo e mensagem de erro ligados por aria. */
export const Campo = forwardRef<HTMLInputElement, ComponentProps<'input'> & { rotulo: string; erro?: string }>(
  function Campo({ rotulo, erro, id, className = '', ...props }, ref) {
    const automatico = useId()
    const idCampo = id ?? (props.name ? `campo-${props.name}` : `campo${automatico.replace(/:/g, '')}`)
    return (
      <div className={className}>
        <label htmlFor={idCampo} className="rotulo">{rotulo}</label>
        <input ref={ref} id={idCampo} className={`campo ${erro ? 'campo-erro' : ''}`}
               aria-invalid={!!erro} aria-describedby={erro ? `${idCampo}-erro` : undefined} {...props} />
        {erro && <p id={`${idCampo}-erro`} className="mt-1.5 text-sm font-medium text-red-500">{erro}</p>}
      </div>
    )
  },
)

export const AreaTexto = forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'> & { rotulo: string; erro?: string }>(
  function AreaTexto({ rotulo, erro, id, className = '', ...props }, ref) {
    const automatico = useId()
    const idCampo = id ?? (props.name ? `campo-${props.name}` : `campo${automatico.replace(/:/g, '')}`)
    return (
      <div className={className}>
        <label htmlFor={idCampo} className="rotulo">{rotulo}</label>
        <textarea ref={ref} id={idCampo} className={`campo min-h-32 resize-y ${erro ? 'campo-erro' : ''}`}
                  aria-invalid={!!erro} aria-describedby={erro ? `${idCampo}-erro` : undefined} {...props} />
        {erro && <p id={`${idCampo}-erro`} className="mt-1.5 text-sm font-medium text-red-500">{erro}</p>}
      </div>
    )
  },
)

export const Selecao = forwardRef<HTMLSelectElement, ComponentProps<'select'> & { rotulo: string; erro?: string }>(
  function Selecao({ rotulo, erro, id, className = '', children, ...props }, ref) {
    const automatico = useId()
    const idCampo = id ?? (props.name ? `campo-${props.name}` : `campo${automatico.replace(/:/g, '')}`)
    return (
      <div className={className}>
        <label htmlFor={idCampo} className="rotulo">{rotulo}</label>
        <select ref={ref} id={idCampo} className={`campo appearance-none bg-[length:12px] ${erro ? 'campo-erro' : ''}`} aria-invalid={!!erro} {...props}>
          {children}
        </select>
        {erro && <p className="mt-1.5 text-sm font-medium text-red-500">{erro}</p>}
      </div>
    )
  },
)

/**
 * Honeypot anti-spam: um campo que humanos não veem (fora da tela, sem foco pelo Tab).
 * Robôs preenchem tudo; a API descarta o envio se ele vier preenchido.
 */
export const Honeypot = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Honeypot(props, ref) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Site <input ref={ref} tabIndex={-1} autoComplete="off" {...props} /></label>
    </div>
  )
})

export function Carregando({ texto = 'Carregando…', className = '' }: { texto?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 opacity-70 ${className}`} role="status">
      <span className="flex h-5 items-end gap-0.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-1 animate-pulse rounded-full bg-primaria" style={{ height: `${40 + i * 15}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      {texto}
    </div>
  )
}

/** Imagem com "blur-up": mostra a miniatura borrada até a versão grande carregar. */
export function ImagemProgressiva({ src, miniatura, alt, className = '', largura, altura }: {
  src: string; miniatura?: string; alt: string; className?: string; largura?: number; altura?: number
}) {
  return (
    <span className={`relative block overflow-hidden bg-superficie ${className}`}
          style={miniatura ? { backgroundImage: `url(${miniatura})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <img
        src={src} alt={alt} loading="lazy" decoding="async" width={largura} height={altura}
        className="size-full object-cover opacity-0 transition-opacity duration-700"
        onLoad={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-100')}
      />
    </span>
  )
}
