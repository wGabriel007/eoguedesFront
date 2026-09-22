/**
 * Cliente HTTP. Todas as chamadas à API passam por aqui, então
 * tratamento de erro, token do admin e URL base ficam num lugar só.
 */
import type { ResultadoUpload } from './tipos'

const BASE: string = import.meta.env.VITE_API_URL ?? '' // vazio = usa o proxy do Vite / Nginx

/** URL absoluta de uma rota da API (para links de download: .ics, press kit). */
export const urlApi = (caminho: string) => `${BASE}${caminho}`

/**
 * Se front e API estiverem em domínios diferentes (ex.: Vercel + Render),
 * as mídias "/midias/..." precisam apontar para o domínio da API.
 * Percorremos o JSON e prefixamos essas URLs. Com proxy (mesmo domínio), nada muda.
 */
function ajustarMidias<T>(valor: T): T {
  if (!BASE) return valor
  if (typeof valor === 'string') return (valor.startsWith('/midias/') ? BASE + valor : valor) as T
  if (Array.isArray(valor)) return valor.map(ajustarMidias) as T
  if (valor && typeof valor === 'object')
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, ajustarMidias(v)])) as T
  return valor
}

/** Formato de erro padrão da API (.NET ProblemDetails / RFC 7807). */
export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}

export class ErroApi extends Error {
  readonly status: number
  readonly problema: ProblemDetails

  constructor(status: number, problema: ProblemDetails) {
    super(problema.detail ?? problema.title ?? mensagemPadrao(status))
    this.status = status
    this.problema = problema
  }

  /** Erros por campo, com as chaves em camelCase (iguais aos nomes do formulário). */
  get erros(): Record<string, string> {
    const saida: Record<string, string> = {}
    for (const [campo, msgs] of Object.entries(this.problema.errors ?? {})) {
      const chave = campo.charAt(0).toLowerCase() + campo.slice(1)
      saida[chave] = msgs[0]
    }
    return saida
  }
}

function mensagemPadrao(status: number) {
  if (status === 429) return 'Muitas tentativas. Espere alguns minutos e tente de novo.'
  if (status === 413) return 'Arquivo grande demais.'
  if (status === 401) return 'Sua sessão expirou. Entre de novo.'
  if (status >= 500) return 'O servidor teve um problema. Tente de novo em instantes.'
  return `Erro ${status}`
}

// ---- Token do painel ----
let token: string | null = null
let aoExpirar: (() => void) | null = null
export const definirToken = (t: string | null) => { token = t }
export const aoSessaoExpirar = (fn: () => void) => { aoExpirar = fn }

export async function api<T = void>(caminho: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let resposta: Response
  try {
    resposta = await fetch(`${BASE}${caminho}`, { ...init, headers })
  } catch {
    throw new ErroApi(0, { title: 'Sem conexão. Confira sua internet.' })
  }

  if (!resposta.ok) {
    const problema: ProblemDetails = await resposta.json().catch(() => ({}))
    if (resposta.status === 401 && token && aoExpirar) aoExpirar()
    throw new ErroApi(resposta.status, problema)
  }

  // 200 sem corpo, 202 e 204: não há JSON para ler.
  const texto = await resposta.text()
  return ajustarMidias((texto ? JSON.parse(texto) : undefined) as T)
}

export const enviarJson = <T = void>(caminho: string, corpo: unknown, metodo = 'POST') =>
  api<T>(caminho, { method: metodo, body: JSON.stringify(corpo) })

/**
 * Upload com barra de progresso. fetch() ainda não informa progresso de envio,
 * então aqui usamos o velho XMLHttpRequest.
 */
export function enviarArquivo(
  arquivo: Blob,
  finalidade: 'Imagem' | 'Video' | 'Audio' | 'Documento',
  aoProgredir?: (percentual: number) => void,
  nome = 'arquivo',
): Promise<ResultadoUpload> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/api/admin/midias?finalidade=${finalidade}`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => e.lengthComputable && aoProgredir?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      let corpo: unknown = {}
      try { corpo = JSON.parse(xhr.responseText || '{}') } catch { /* corpo vazio */ }
      // No upload guardamos a URL relativa ("/midias/..."): é ela que vai para o banco.
      if (xhr.status >= 200 && xhr.status < 300) resolve(corpo as ResultadoUpload)
      else reject(new ErroApi(xhr.status, corpo as ProblemDetails))
    }
    xhr.onerror = () => reject(new ErroApi(0, { title: 'Falha de conexão durante o envio.' }))
    const form = new FormData()
    form.append('arquivo', arquivo, nome)
    xhr.send(form)
  })
}
