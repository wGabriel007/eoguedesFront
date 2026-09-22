import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * PLAYER PERSISTENTE
 * Um único <audio> vive aqui, fora das seções. Por isso a música continua
 * tocando enquanto a pessoa rola a página (e até se abrir um modal).
 * O AnalyserNode do Web Audio entrega as frequências para o visualizador.
 */

export interface FaixaTocavel {
  id: string
  titulo: string
  subtitulo: string
  url: string
  capa: string
}

interface EstadoPlayer {
  atual: FaixaTocavel | null
  fila: FaixaTocavel[]
  tocando: boolean
  progresso: number // 0..1
  duracao: number
  analisador: AnalyserNode | null
  tocar: (faixa: FaixaTocavel, fila?: FaixaTocavel[]) => void
  alternar: () => void
  proxima: () => void
  anterior: () => void
  buscar: (fracao: number) => void
  fechar: () => void
}

const Contexto = createContext<EstadoPlayer | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const ctxAudio = useRef<AudioContext | null>(null)
  const [analisador, setAnalisador] = useState<AnalyserNode | null>(null)
  const [atual, setAtual] = useState<FaixaTocavel | null>(null)
  const [fila, setFila] = useState<FaixaTocavel[]>([])
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)

  // Cria o <audio> uma vez só.
  useEffect(() => {
    const el = new Audio()
    el.preload = 'metadata'
    el.crossOrigin = 'anonymous' // necessário para o analisador ler áudio servido por outra origem
    audio.current = el
    const atualizar = () => {
      setProgresso(el.duration ? el.currentTime / el.duration : 0)
      setDuracao(el.duration || 0)
    }
    el.addEventListener('timeupdate', atualizar)
    el.addEventListener('loadedmetadata', atualizar)
    el.addEventListener('play', () => setTocando(true))
    el.addEventListener('pause', () => setTocando(false))
    return () => { el.pause(); el.src = '' }
  }, [])

  // O Web Audio só pode ser ligado depois de um clique (regra dos navegadores).
  const garantirAnalisador = useCallback(() => {
    if (ctxAudio.current || !audio.current) return
    try {
      const ctx = new AudioContext()
      const fonte = ctx.createMediaElementSource(audio.current)
      const an = ctx.createAnalyser()
      an.fftSize = 128
      an.smoothingTimeConstant = 0.78
      fonte.connect(an)
      an.connect(ctx.destination)
      ctxAudio.current = ctx
      setAnalisador(an)
    } catch {
      /* navegador sem Web Audio: o player funciona sem o visualizador */
    }
  }, [])

  const tocar = useCallback((faixa: FaixaTocavel, novaFila?: FaixaTocavel[]) => {
    const el = audio.current
    if (!el) return
    garantirAnalisador()
    void ctxAudio.current?.resume()
    if (novaFila) setFila(novaFila)
    if (atual?.id === faixa.id) {
      if (el.paused) void el.play()
      else el.pause()
      return
    }
    el.src = faixa.url
    setAtual(faixa)
    setProgresso(0)
    void el.play().catch(() => setTocando(false))
  }, [atual, garantirAnalisador])

  const irPara = useCallback((passo: number) => {
    if (!atual || fila.length === 0) return
    const i = fila.findIndex((f) => f.id === atual.id)
    const prox = fila[(i + passo + fila.length) % fila.length]
    if (prox) tocar(prox)
  }, [atual, fila, tocar])

  // Ao terminar uma faixa, passa para a próxima da fila.
  useEffect(() => {
    const el = audio.current
    if (!el) return
    const aoTerminar = () => (fila.length > 1 ? irPara(1) : setTocando(false))
    el.addEventListener('ended', aoTerminar)
    return () => el.removeEventListener('ended', aoTerminar)
  }, [fila, irPara])

  // Teclas de mídia do celular / fone Bluetooth / tela de bloqueio.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !atual) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: atual.titulo, artist: atual.subtitulo, artwork: [{ src: atual.capa, sizes: '512x512' }],
    })
    navigator.mediaSession.setActionHandler('play', () => void audio.current?.play())
    navigator.mediaSession.setActionHandler('pause', () => audio.current?.pause())
    navigator.mediaSession.setActionHandler('nexttrack', () => irPara(1))
    navigator.mediaSession.setActionHandler('previoustrack', () => irPara(-1))
  }, [atual, irPara])

  const valor = useMemo<EstadoPlayer>(() => ({
    atual, fila, tocando, progresso, duracao, analisador, tocar,
    alternar: () => {
      const el = audio.current
      if (!el || !atual) return
      void ctxAudio.current?.resume()
      if (el.paused) void el.play()
      else el.pause()
    },
    proxima: () => irPara(1),
    anterior: () => irPara(-1),
    buscar: (fracao) => {
      const el = audio.current
      if (el?.duration) el.currentTime = fracao * el.duration
    },
    fechar: () => {
      audio.current?.pause()
      setAtual(null)
    },
  }), [atual, fila, tocando, progresso, duracao, analisador, tocar, irPara])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('usePlayer precisa estar dentro de <PlayerProvider>')
  return ctx
}
