import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { aoSessaoExpirar, definirToken, enviarJson } from '../lib/api'
import type { Sessao } from '../lib/tipos'

const CHAVE = 'eoguedes.sessao'

interface EstadoSessao {
  sessao: Sessao | null
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => void
}

const Contexto = createContext<EstadoSessao | null>(null)

/** Lê a sessão salva e descarta se o token já venceu. */
function sessaoSalva(): Sessao | null {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Sessao | null
    if (s && new Date(s.expiraEmUtc).getTime() > Date.now() + 60_000) return s
  } catch { /* armazenamento indisponível (aba anônima, etc.) */ }
  return null
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const s = sessaoSalva()
    definirToken(s?.token ?? null)
    return s
  })

  const sair = useCallback(() => {
    definirToken(null)
    try { localStorage.removeItem(CHAVE) } catch { /* ignora */ }
    setSessao(null)
  }, [])

  // Se a API responder 401 (token vencido), volta para a tela de login.
  useEffect(() => { aoSessaoExpirar(sair) }, [sair])

  const entrar = useCallback(async (email: string, senha: string) => {
    const s = await enviarJson<Sessao>('/api/auth/login', { email, senha })
    definirToken(s.token)
    try { localStorage.setItem(CHAVE, JSON.stringify(s)) } catch { /* ignora */ }
    setSessao(s)
  }, [])

  return <Contexto.Provider value={{ sessao, entrar, sair }}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessao() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>')
  return ctx
}
