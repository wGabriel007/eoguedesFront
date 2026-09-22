import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ReactNode } from 'react'
import { enviarArquivo, ErroApi } from '../../lib/api'
import { otimizarImagem } from '../../lib/imagem'
import { IconeLixeira } from '../ui/Icones'

/**
 * Peças reaproveitadas em todas as telas do painel.
 */

/** Chaves do TanStack Query que o site público usa: invalidamos todas depois de salvar. */
const CHAVES_SITE = ['artista', 'shows', 'lancamentos', 'videos', 'fotos', 'trajetoria', 'recados']

/**
 * Executa uma ação (salvar, excluir...) e depois recarrega as listas do painel e do site.
 * Mostra o erro da API se der errado.
 */
export function useAcao<T = void>(acao: (v: T) => Promise<unknown>, chaves: string[] = []) {
  const qc = useQueryClient()
  const [erro, setErro] = useState<string | null>(null)
  const m = useMutation({
    mutationFn: acao,
    onMutate: () => setErro(null),
    onSuccess: () => {
      ;[...chaves, ...CHAVES_SITE, 'admin'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
    },
    onError: (e) => setErro(e instanceof ErroApi
      ? Object.values(e.erros)[0] ?? e.message
      : 'Algo deu errado.'),
  })
  return { ...m, erro }
}

export function CabecalhoPagina({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-5xl sm:text-6xl">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-2xl text-texto-suave">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-superficie p-5 ring-1 ring-white/5 ${className}`}>{children}</div>
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-white/10 p-10 text-center text-texto-suave">{children}</div>
}

export function MensagemErro({ erro }: { erro: string | null }) {
  return erro ? <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">{erro}</p> : null
}

export function BotaoExcluir({ aoConfirmar, rotulo = 'Excluir' }: { aoConfirmar: () => void; rotulo?: string }) {
  const [confirmando, setConfirmando] = useState(false)
  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-1">
        <button onClick={() => { setConfirmando(false); aoConfirmar() }} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">Confirmar</button>
        <button onClick={() => setConfirmando(false)} className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">Cancelar</button>
      </span>
    )
  }
  return (
    <button onClick={() => setConfirmando(true)} aria-label={rotulo} title={rotulo}
            className="grid size-9 place-items-center rounded-full text-red-400 ring-1 ring-red-400/30 hover:bg-red-500/10">
      <IconeLixeira width={16} />
    </button>
  )
}

type Finalidade = 'Imagem' | 'Video' | 'Audio' | 'Documento'
const ACEITA: Record<Finalidade, string> = {
  Imagem: 'image/jpeg,image/png,image/webp',
  Video: 'video/mp4,video/webm',
  Audio: 'audio/mpeg,audio/mp4,audio/x-m4a',
  Documento: 'application/pdf',
}

/**
 * Campo de mídia: mostra o que já está salvo e deixa trocar enviando um arquivo.
 * Imagens são otimizadas no navegador antes do envio.
 */
export function CampoMidia({ rotulo, valor, aoMudar, finalidade, dica, maxLado = 2000 }: {
  rotulo: string; valor: string | null | undefined; aoMudar: (url: string | null) => void
  finalidade: Finalidade; dica?: string; maxLado?: number
}) {
  const input = useRef<HTMLInputElement>(null)
  const [progresso, setProgresso] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const escolher = async (arquivo?: File) => {
    if (!arquivo) return
    setErro(null)
    setProgresso(0)
    try {
      const conteudo = finalidade === 'Imagem' ? await otimizarImagem(arquivo, maxLado) : arquivo
      const nome = finalidade === 'Imagem' && conteudo !== arquivo ? 'imagem.webp' : arquivo.name
      const r = await enviarArquivo(conteudo, finalidade, setProgresso, nome)
      aoMudar(r.url)
    } catch (e) {
      setErro(e instanceof ErroApi ? Object.values(e.erros)[0] ?? e.message : 'Falha no envio.')
    } finally {
      setProgresso(null)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div>
      <span className="rotulo">{rotulo}</span>
      <div className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-white/10">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-fundo text-[10px] text-texto-suave">
          {!valor ? 'vazio'
            : finalidade === 'Imagem' ? <img src={valor} alt="" className="size-full object-cover" />
            : finalidade === 'Video' ? <video src={valor} muted className="size-full object-cover" />
            : finalidade === 'Audio' ? '♪ áudio' : 'PDF'}
        </div>
        <div className="min-w-0 flex-1">
          {progresso !== null ? (
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progresso}>
              <div className="h-full bg-primaria transition-all" style={{ width: `${progresso}%` }} />
            </div>
          ) : (
            <p className="truncate text-xs text-texto-suave">{valor ?? dica ?? 'Nenhum arquivo'}</p>
          )}
          {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={progresso !== null}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase hover:bg-white/20">
          {valor ? 'Trocar' : 'Enviar'}
        </button>
        {valor && <button type="button" onClick={() => aoMudar(null)} className="text-xs text-texto-suave underline">remover</button>}
        <input ref={input} type="file" accept={ACEITA[finalidade]} hidden onChange={(e) => escolher(e.target.files?.[0])} />
      </div>
    </div>
  )
}

export function Interruptor({ ligado, aoMudar, rotulo }: { ligado: boolean; aoMudar: (v: boolean) => void; rotulo: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold">
      <button type="button" role="switch" aria-checked={ligado} onClick={() => aoMudar(!ligado)}
              className={`relative h-6 w-11 rounded-full transition ${ligado ? 'bg-primaria' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${ligado ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {rotulo}
    </label>
  )
}
