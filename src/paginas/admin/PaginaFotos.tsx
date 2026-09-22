import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { BotaoExcluir, CabecalhoPagina, Cartao, MensagemErro, useAcao, Vazio } from '../../componentes/admin/Kit'
import { IconeEstrela } from '../../componentes/ui/Icones'
import { api, enviarArquivo, enviarJson, ErroApi } from '../../lib/api'
import { useFotos } from '../../lib/consultas'
import { prepararFoto, tamanhoLegivel } from '../../lib/imagem'
import { CATEGORIAS_FOTO, type CategoriaFoto, type Foto } from '../../lib/tipos'

interface ItemEnvio { id: string; nome: string; tamanhoOriginal: number; estado: 'preparando' | 'enviando' | 'pronto' | 'erro'; progresso: number; erro?: string; tamanhoFinal?: number }

/**
 * Envio de várias fotos de uma vez (arrastar e soltar ou escolher no celular).
 * Cada foto é redimensionada no navegador (WebP grande + miniatura) e enviada
 * com barra de progresso própria. Duas por vez, para não travar o 4G.
 */
function Envio({ categoria }: { categoria: CategoriaFoto }) {
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [itens, setItens] = useState<ItemEnvio[]>([])
  const [arrastando, setArrastando] = useState(false)

  const atualizar = (id: string, parcial: Partial<ItemEnvio>) => setItens((l) => l.map((i) => (i.id === id ? { ...i, ...parcial } : i)))

  const enviarUma = async (arquivo: File, id: string) => {
    try {
      const f = await prepararFoto(arquivo)
      atualizar(id, { estado: 'enviando', tamanhoFinal: f.grande.size })
      const grande = await enviarArquivo(f.grande, 'Imagem', (p) => atualizar(id, { progresso: Math.round(p * 0.9) }), 'foto.webp')
      const mini = await enviarArquivo(f.miniatura, 'Imagem', undefined, 'mini.webp')
      await enviarJson('/api/admin/fotos', { url: grande.url, urlMiniatura: mini.url, categoria, largura: f.largura, altura: f.altura, legenda: null })
      atualizar(id, { estado: 'pronto', progresso: 100 })
    } catch (e) {
      atualizar(id, { estado: 'erro', erro: e instanceof ErroApi ? Object.values(e.erros)[0] ?? e.message : 'Não foi possível ler esta imagem.' })
    }
  }

  const receber = async (lista: FileList | null) => {
    if (!lista?.length) return
    const arquivos = Array.from(lista).filter((a) => a.type.startsWith('image/'))
    const novos = arquivos.map((a) => ({ arquivo: a, item: { id: crypto.randomUUID(), nome: a.name, tamanhoOriginal: a.size, estado: 'preparando', progresso: 0 } as ItemEnvio }))
    setItens((l) => [...novos.map((n) => n.item), ...l])
    // fila com 2 envios simultâneos
    const fila = [...novos]
    await Promise.all([0, 1].map(async () => { for (let n = fila.shift(); n; n = fila.shift()) await enviarUma(n.arquivo, n.item.id) }))
    qc.invalidateQueries({ queryKey: ['fotos'] })
    qc.invalidateQueries({ queryKey: ['admin'] })
    if (input.current) input.current.value = ''
  }

  return (
    <div className="mb-8">
      <div onDragOver={(e) => { e.preventDefault(); setArrastando(true) }} onDragLeave={() => setArrastando(false)}
           onDrop={(e) => { e.preventDefault(); setArrastando(false); void receber(e.dataTransfer.files) }}
           className={`grid place-items-center rounded-3xl border-2 border-dashed p-10 text-center transition ${arrastando ? 'border-primaria bg-primaria/10' : 'border-white/15'}`}>
        <p className="font-display text-3xl uppercase">Arraste as fotos aqui</p>
        <p className="mt-1 text-sm text-texto-suave">ou</p>
        <button type="button" onClick={() => input.current?.click()} className="botao-primario mt-3">Escolher fotos</button>
        <p className="mt-3 text-xs text-texto-suave">Pode escolher várias. Elas são otimizadas antes de enviar (bem mais leves).</p>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => void receber(e.target.files)} />
      </div>
      {itens.length > 0 && (
        <ul className="mt-4 space-y-2">
          {itens.slice(0, 12).map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded-xl bg-superficie px-4 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{i.nome}</span>
              <span className="text-xs text-texto-suave">{tamanhoLegivel(i.tamanhoOriginal)}{i.tamanhoFinal ? ` → ${tamanhoLegivel(i.tamanhoFinal)}` : ''}</span>
              {i.estado === 'erro' ? <span className="text-xs font-semibold text-red-400">{i.erro}</span>
                : i.estado === 'pronto' ? <span className="text-xs font-bold text-secundaria">✓ enviada</span>
                : <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-primaria transition-all" style={{ width: `${i.estado === 'preparando' ? 5 : i.progresso}%` }} /></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ROTULO: Record<CategoriaFoto, string> = { Show: 'Show', Ensaio: 'Ensaio', Bastidores: 'Bastidores', Bairro: 'Bairro' }

export function PaginaFotos() {
  const { data: fotos = [], isLoading } = useFotos()
  const [categoria, setCategoria] = useState<CategoriaFoto>('Show')
  const editar = useAcao(({ f, parcial }: { f: Foto; parcial: Partial<Foto> }) => {
    const n = { ...f, ...parcial }
    return enviarJson(`/api/admin/fotos/${f.id}`, { legenda: n.legenda, categoria: n.categoria, ordem: n.ordem, destaque: n.destaque }, 'PUT')
  })
  const excluir = useAcao((id: string) => api(`/api/admin/fotos/${id}`, { method: 'DELETE' }))

  return (
    <>
      <CabecalhoPagina titulo="Fotos" descricao="As fotos de Ensaio aparecem no carrossel da biografia. Estrela = destaque (vai para o press kit e aparece primeiro)." />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rotulo mb-0">Enviar como:</span>
        {CATEGORIAS_FOTO.map((c) => (
          <button key={c} type="button" aria-pressed={categoria === c} onClick={() => setCategoria(c)}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-white/15 aria-pressed:bg-primaria aria-pressed:text-sobre-primaria">{ROTULO[c]}</button>
        ))}
      </div>
      <Envio categoria={categoria} />
      <MensagemErro erro={editar.erro ?? excluir.erro} />
      {isLoading ? null : fotos.length === 0 ? <Vazio>Nenhuma foto ainda.</Vazio> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {fotos.map((f) => (
            <Cartao key={f.id} className="p-2">
              <div className="relative">
                <img src={f.urlMiniatura} alt={f.legenda ?? ''} className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
                <button onClick={() => editar.mutate({ f, parcial: { destaque: !f.destaque } })} aria-pressed={f.destaque} aria-label="Destaque"
                        className={`absolute right-2 top-2 grid size-9 place-items-center rounded-full backdrop-blur ${f.destaque ? 'bg-secundaria text-sobre-secundaria' : 'bg-black/50 text-white'}`}>
                  <IconeEstrela width={16} />
                </button>
              </div>
              <div className="mt-2 space-y-2 p-1">
                <input className="campo py-2 text-sm" placeholder="Legenda" defaultValue={f.legenda ?? ''}
                       onBlur={(e) => e.target.value !== (f.legenda ?? '') && editar.mutate({ f, parcial: { legenda: e.target.value || null } })} />
                <div className="flex items-center gap-2">
                  <select className="campo flex-1 py-2 text-sm" value={f.categoria} onChange={(e) => editar.mutate({ f, parcial: { categoria: e.target.value as CategoriaFoto } })}>
                    {CATEGORIAS_FOTO.map((c) => <option key={c} value={c} className="bg-fundo">{ROTULO[c]}</option>)}
                  </select>
                  <BotaoExcluir aoConfirmar={() => excluir.mutate(f.id)} />
                </div>
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </>
  )
}
