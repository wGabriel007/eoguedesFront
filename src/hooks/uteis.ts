import Lenis from 'lenis'
import { useEffect, useState, useSyncExternalStore } from 'react'

/** true se o sistema pede menos animação (acessibilidade). */
export function useMenosMovimento() {
  return useMidia('(prefers-reduced-motion: reduce)')
}

/** true em dispositivos com mouse (cursor personalizado, holofote que segue o mouse). */
export function usePonteiroFino() {
  return useMidia('(hover: hover) and (pointer: fine)')
}

export function useMidia(consulta: string) {
  return useSyncExternalStore(
    (aoMudar) => {
      const mq = window.matchMedia(consulta)
      mq.addEventListener('change', aoMudar)
      return () => mq.removeEventListener('change', aoMudar)
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}

/** Conexão lenta ou "economia de dados" ligada: não baixamos o vídeo do hero. */
export function useEconomiaDeDados() {
  const [economia] = useState(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)))
  })
  return economia
}

let lenis: Lenis | null = null

/** Scroll suave (Lenis). Desligado para quem prefere menos movimento. */
export function useScrollSuave(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return
    // O Lenis já respeita o scroll-padding-top do CSS (80px, altura do menu): nada de offset extra aqui.
    lenis = new Lenis({ duration: 1.1, anchors: true })
    let raf = 0
    const quadro = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(quadro) }
    raf = requestAnimationFrame(quadro)
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null }
  }, [ativo])
}

/** Rola até uma seção pelo id, usando o Lenis quando ele estiver ligado. */
export function rolarPara(id: string) {
  const alvo = document.getElementById(id)
  if (!alvo) return
  if (lenis) lenis.scrollTo(alvo)
  else alvo.scrollIntoView({ behavior: 'smooth' })
}

/** Pausa o scroll da página (modais abertos). */
export function useTravarScroll(travado: boolean) {
  useEffect(() => {
    if (!travado) return
    lenis?.stop()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { lenis?.start(); document.body.style.overflow = anterior }
  }, [travado])
}
