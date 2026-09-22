import { useState } from 'react'
import { BotaoExcluir, CabecalhoPagina, CampoMidia, Cartao, Interruptor, MensagemErro, useAcao, Vazio } from '../../componentes/admin/Kit'
import { AreaTexto, Campo } from '../../componentes/ui/Basicos'
import { IconeLapis, IconeMais, IconeYouTube } from '../../componentes/ui/Icones'
import { Modal } from '../../componentes/ui/Modal'
import { api, enviarJson } from '../../lib/api'
import { useTrajetoria, useVideos } from '../../lib/consultas'
import type { Marco, Video } from '../../lib/tipos'

// ============================================================ CLIPES
interface FormVideo { id?: string; modo: 'youtube' | 'upload'; titulo: string; link: string; url: string | null; urlCapa: string | null; data: string; destaque: boolean; ordem: number }

export function PaginaClipes() {
  const { data: videos = [], isLoading } = useVideos()
  const [form, setForm] = useState<FormVideo | null>(null)

  const salvar = useAcao(async (f: FormVideo) => {
    const data = f.data || null
    if (f.id) return enviarJson(`/api/admin/videos/${f.id}`, { titulo: f.titulo, dataLancamento: data, urlCapa: f.urlCapa, destaque: f.destaque, ordem: f.ordem }, 'PUT')
    const criado = f.modo === 'youtube'
      ? await enviarJson<Video>('/api/admin/videos/youtube', { titulo: f.titulo, link: f.link, dataLancamento: data })
      : await enviarJson<Video>('/api/admin/videos/upload', { titulo: f.titulo, url: f.url, urlCapa: f.urlCapa, dataLancamento: data })
    if (f.destaque) await enviarJson(`/api/admin/videos/${criado.id}`, { titulo: f.titulo, dataLancamento: data, urlCapa: null, destaque: true, ordem: f.ordem }, 'PUT')
  })
  const excluir = useAcao((id: string) => api(`/api/admin/videos/${id}`, { method: 'DELETE' }))

  const novo = (): FormVideo => ({ modo: 'youtube', titulo: '', link: '', url: null, urlCapa: null, data: '', destaque: false, ordem: videos.length })
  const editar = (v: Video) => setForm({ id: v.id, modo: v.tipo === 'YouTube' ? 'youtube' : 'upload', titulo: v.titulo, link: v.youTubeId ?? '', url: v.url, urlCapa: v.urlCapa, data: v.dataLancamento ?? '', destaque: v.destaque, ordem: v.ordem })

  return (
    <>
      <CabecalhoPagina titulo="Clipes" descricao="Cole o link do YouTube (recomendado) ou envie o vídeo. Os marcados como destaque aparecem primeiro."
                       acao={<button onClick={() => setForm(novo())} className="botao-primario"><IconeMais /> Novo clipe</button>} />
      <MensagemErro erro={excluir.erro} />
      {isLoading ? null : videos.length === 0 ? <Vazio>Nenhum clipe ainda.</Vazio> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v) => (
            <Cartao key={v.id} className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-black">
                {v.urlCapa && <img src={v.urlCapa} alt="" className="size-full object-cover" />}
                {v.destaque && <span className="absolute left-3 top-3 rounded-full bg-secundaria px-2 py-0.5 text-[10px] font-bold uppercase text-sobre-secundaria">Destaque</span>}
                {v.tipo === 'YouTube' && <IconeYouTube className="absolute right-3 top-3 text-red-500" width={24} />}
              </div>
              <div className="flex items-center gap-2 p-4">
                <p className="min-w-0 flex-1 truncate font-semibold">{v.titulo}</p>
                <button onClick={() => editar(v)} aria-label="Editar" className="grid size-9 place-items-center rounded-full ring-1 ring-white/15"><IconeLapis width={16} /></button>
                <BotaoExcluir aoConfirmar={() => excluir.mutate(v.id)} />
              </div>
            </Cartao>
          ))}
        </div>
      )}

      <Modal aberto={!!form} aoFechar={() => setForm(null)} titulo={form?.id ? 'Editar clipe' : 'Novo clipe'}>
        {form && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(form, { onSuccess: () => setForm(null) }) }}>
            {!form.id && (
              <div className="flex gap-2" role="group">
                {(['youtube', 'upload'] as const).map((m) => (
                  <button key={m} type="button" aria-pressed={form.modo === m} onClick={() => setForm({ ...form, modo: m })}
                          className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/15 aria-pressed:bg-primaria aria-pressed:text-sobre-primaria">
                    {m === 'youtube' ? 'Link do YouTube' : 'Enviar arquivo'}
                  </button>
                ))}
              </div>
            )}
            <Campo rotulo="Título" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            {!form.id && form.modo === 'youtube' && (
              <Campo rotulo="Link do YouTube" required placeholder="https://youtube.com/watch?v=… ou youtu.be/…" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            )}
            {!form.id && form.modo === 'upload' && (
              <CampoMidia rotulo="Vídeo (MP4, até 300 MB)" finalidade="Video" valor={form.url} aoMudar={(u) => setForm({ ...form, url: u })} />
            )}
            {(form.modo === 'upload' || form.id) && (
              <CampoMidia rotulo="Capa (16:9)" finalidade="Imagem" valor={form.urlCapa} aoMudar={(u) => setForm({ ...form, urlCapa: u })} maxLado={1600} />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Data de lançamento" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              <Campo rotulo="Ordem" type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
            </div>
            <Interruptor ligado={form.destaque} aoMudar={(v) => setForm({ ...form, destaque: v })} rotulo="Destaque (aparece primeiro, com selo de lançamento)" />
            <MensagemErro erro={salvar.erro} />
            <button disabled={salvar.isPending || (form.modo === 'upload' && !form.url && !form.id)} className="botao-primario w-full">{salvar.isPending ? 'Salvando…' : 'Salvar'}</button>
          </form>
        )}
      </Modal>
    </>
  )
}

// ============================================================ TRAJETÓRIA
interface FormMarco { id?: string; ano: number; titulo: string; descricao: string; urlFoto: string | null; ordem: number }

export function PaginaTrajetoria() {
  const { data: marcos = [], isLoading } = useTrajetoria()
  const [form, setForm] = useState<FormMarco | null>(null)
  const salvar = useAcao(async (f: FormMarco) => {
    const corpo = { ano: f.ano, titulo: f.titulo, descricao: f.descricao, urlFoto: f.urlFoto, ordem: f.ordem }
    if (f.id) await enviarJson(`/api/admin/trajetoria/${f.id}`, corpo, 'PUT')
    else await enviarJson('/api/admin/trajetoria', corpo)
  })
  const excluir = useAcao((id: string) => api(`/api/admin/trajetoria/${id}`, { method: 'DELETE' }))

  return (
    <>
      <CabecalhoPagina titulo="Trajetória" descricao="Os marcos da seção #dobairropropalco, em ordem de ano."
                       acao={<button onClick={() => setForm({ ano: new Date().getFullYear(), titulo: '', descricao: '', urlFoto: null, ordem: 0 })} className="botao-primario"><IconeMais /> Novo marco</button>} />
      <MensagemErro erro={excluir.erro} />
      {isLoading ? null : marcos.length === 0 ? <Vazio>Nenhum marco ainda. Comece pelo primeiro show no bairro!</Vazio> : (
        <ol className="space-y-3">
          {marcos.map((m: Marco) => (
            <Cartao key={m.id} className="flex items-center gap-4">
              {m.urlFoto ? <img src={m.urlFoto} alt="" className="size-16 rounded-xl object-cover" /> : <div className="size-16 rounded-xl bg-fundo" />}
              <p className="font-display text-4xl text-primaria">{m.ano}</p>
              <div className="min-w-0 flex-1"><p className="font-semibold">{m.titulo}</p><p className="truncate text-sm text-texto-suave">{m.descricao}</p></div>
              <button onClick={() => setForm({ ...m })} aria-label="Editar" className="grid size-9 place-items-center rounded-full ring-1 ring-white/15"><IconeLapis width={16} /></button>
              <BotaoExcluir aoConfirmar={() => excluir.mutate(m.id)} />
            </Cartao>
          ))}
        </ol>
      )}
      <Modal aberto={!!form} aoFechar={() => setForm(null)} titulo={form?.id ? 'Editar marco' : 'Novo marco'}>
        {form && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(form, { onSuccess: () => setForm(null) }) }}>
            <div className="grid grid-cols-2 gap-4">
              <Campo rotulo="Ano" type="number" required min={1950} max={2100} value={form.ano} onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })} />
              <Campo rotulo="Ordem no mesmo ano" type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
            </div>
            <Campo rotulo="Título" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <AreaTexto rotulo="Descrição (2 ou 3 linhas)" required maxLength={1000} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <CampoMidia rotulo="Foto" finalidade="Imagem" valor={form.urlFoto} aoMudar={(u) => setForm({ ...form, urlFoto: u })} maxLado={1600} />
            <MensagemErro erro={salvar.erro} />
            <button disabled={salvar.isPending} className="botao-primario w-full">{salvar.isPending ? 'Salvando…' : 'Salvar'}</button>
          </form>
        )}
      </Modal>
    </>
  )
}
