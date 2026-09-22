import { useState } from 'react'
import { BotaoExcluir, CabecalhoPagina, CampoMidia, Cartao, MensagemErro, useAcao, Vazio } from '../../componentes/admin/Kit'
import { Campo, Selecao } from '../../componentes/ui/Basicos'
import { IconeLapis, IconeMais, IconeLixeira } from '../../componentes/ui/Icones'
import { Modal } from '../../componentes/ui/Modal'
import { api, enviarJson } from '../../lib/api'
import { useLancamentos } from '../../lib/consultas'
import { anoDe } from '../../lib/formatos'
import { NOMES_PLATAFORMA, type Lancamento, type PlataformaStreaming, type TipoLancamento } from '../../lib/tipos'

interface FaixaForm { titulo: string; duracao: string; urlPrevia: string | null }
interface FormLancamento { id?: string; titulo: string; tipo: TipoLancamento; dataLancamento: string; urlCapa: string | null; faixas: FaixaForm[]; links: Partial<Record<PlataformaStreaming, string>> }

const PLATAFORMAS: PlataformaStreaming[] = ['Spotify', 'YouTubeMusic', 'AppleMusic', 'Deezer', 'AmazonMusic', 'SoundCloud']
const NOVO: FormLancamento = { titulo: '', tipo: 'Single', dataLancamento: '', urlCapa: null, faixas: [{ titulo: '', duracao: '', urlPrevia: null }], links: {} }

/** "2:34" → 154 segundos */
const paraSegundos = (t: string) => {
  const [m, s] = t.split(':').map(Number)
  return Number.isFinite(m) ? m * 60 + (Number.isFinite(s) ? s : 0) : null
}
const paraMinutos = (s: number | null) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '')

export function PaginaDiscografia() {
  const { data: lancamentos = [], isLoading } = useLancamentos()
  const [form, setForm] = useState<FormLancamento | null>(null)

  const salvar = useAcao(async (f: FormLancamento) => {
    const corpo = {
      titulo: f.titulo, tipo: f.tipo, dataLancamento: f.dataLancamento, urlCapa: f.urlCapa ?? '',
      faixas: f.faixas.filter((x) => x.titulo.trim()).map((x) => ({ titulo: x.titulo, duracaoSegundos: paraSegundos(x.duracao), urlPrevia: x.urlPrevia })),
      links: Object.entries(f.links).filter(([, u]) => u?.trim()).map(([plataforma, url]) => ({ plataforma, url })),
    }
    if (f.id) await enviarJson(`/api/admin/lancamentos/${f.id}`, corpo, 'PUT')
    else await enviarJson('/api/admin/lancamentos', corpo)
  })
  const excluir = useAcao((id: string) => api(`/api/admin/lancamentos/${id}`, { method: 'DELETE' }))

  const editar = (l: Lancamento) => setForm({
    id: l.id, titulo: l.titulo, tipo: l.tipo, dataLancamento: l.dataLancamento, urlCapa: l.urlCapa,
    faixas: l.faixas.map((f) => ({ titulo: f.titulo, duracao: paraMinutos(f.duracaoSegundos), urlPrevia: f.urlPrevia })),
    links: Object.fromEntries(l.links.map((x) => [x.plataforma, x.url])),
  })
  const mudarFaixa = (i: number, parcial: Partial<FaixaForm>) =>
    setForm({ ...form!, faixas: form!.faixas.map((f, k) => (k === i ? { ...f, ...parcial } : f)) })

  return (
    <>
      <CabecalhoPagina titulo="Discografia" descricao="Capas, faixas com prévia de ~30s (tocam no player do site) e links das plataformas."
                       acao={<button onClick={() => setForm(NOVO)} className="botao-primario"><IconeMais /> Novo lançamento</button>} />
      <MensagemErro erro={excluir.erro} />
      {isLoading ? null : lancamentos.length === 0 ? <Vazio>Nenhum lançamento cadastrado.</Vazio> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lancamentos.map((l) => (
            <Cartao key={l.id} className="flex gap-4">
              <img src={l.urlCapa} alt="" className="size-24 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-secundaria">{l.tipo} · {anoDe(l.dataLancamento)}</p>
                <p className="truncate font-display text-2xl uppercase">{l.titulo}</p>
                <p className="text-xs text-texto-suave">{l.faixas.length} faixa(s) · {l.faixas.filter((f) => f.urlPrevia).length} com prévia · {l.links.length} link(s)</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => editar(l)} aria-label="Editar" className="grid size-9 place-items-center rounded-full ring-1 ring-white/15 hover:bg-white/5"><IconeLapis width={16} /></button>
                  <BotaoExcluir aoConfirmar={() => excluir.mutate(l.id)} />
                </div>
              </div>
            </Cartao>
          ))}
        </div>
      )}

      <Modal aberto={!!form} aoFechar={() => setForm(null)} titulo={form?.id ? 'Editar lançamento' : 'Novo lançamento'} largura="max-w-3xl">
        {form && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); salvar.mutate(form, { onSuccess: () => setForm(null) }) }}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="Título" required className="sm:col-span-3" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <Selecao rotulo="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento })}>
                <option value="Single" className="bg-fundo">Single</option><option value="EP" className="bg-fundo">EP</option><option value="Album" className="bg-fundo">Álbum</option>
              </Selecao>
              <Campo rotulo="Data de lançamento" type="date" required value={form.dataLancamento} onChange={(e) => setForm({ ...form, dataLancamento: e.target.value })} />
            </div>
            <CampoMidia rotulo="Capa (quadrada, 1400×1400)" finalidade="Imagem" valor={form.urlCapa} aoMudar={(u) => setForm({ ...form, urlCapa: u })} maxLado={1400} />

            <fieldset>
              <legend className="rotulo">Faixas</legend>
              <div className="space-y-3">
                {form.faixas.map((f, i) => (
                  <div key={i} className="rounded-xl p-3 ring-1 ring-white/10">
                    <div className="flex items-end gap-2">
                      <span className="pb-3 text-sm text-texto-suave">{i + 1}.</span>
                      <Campo rotulo="Título" className="flex-1" value={f.titulo} onChange={(e) => mudarFaixa(i, { titulo: e.target.value })} />
                      <Campo rotulo="Duração" placeholder="2:34" className="w-24" value={f.duracao} onChange={(e) => mudarFaixa(i, { duracao: e.target.value })} />
                      <button type="button" aria-label="Remover faixa" onClick={() => setForm({ ...form, faixas: form.faixas.filter((_, k) => k !== i) })}
                              className="mb-1 grid size-10 place-items-center rounded-full text-red-400 hover:bg-red-500/10"><IconeLixeira width={16} /></button>
                    </div>
                    <div className="mt-2"><CampoMidia rotulo="Prévia em MP3 (~30s)" finalidade="Audio" valor={f.urlPrevia} aoMudar={(u) => mudarFaixa(i, { urlPrevia: u })} /></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setForm({ ...form, faixas: [...form.faixas, { titulo: '', duracao: '', urlPrevia: null }] })}
                      className="mt-3 text-sm font-semibold text-primaria">+ adicionar faixa</button>
            </fieldset>

            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="rotulo">Links nas plataformas</legend>
              {PLATAFORMAS.map((p) => (
                <Campo key={p} rotulo={NOMES_PLATAFORMA[p]} type="url" placeholder="https://…" value={form.links[p] ?? ''}
                       onChange={(e) => setForm({ ...form, links: { ...form.links, [p]: e.target.value } })} />
              ))}
            </fieldset>

            <MensagemErro erro={salvar.erro} />
            <button disabled={salvar.isPending || !form.urlCapa} className="botao-primario w-full">{salvar.isPending ? 'Salvando…' : !form.urlCapa ? 'Envie a capa para salvar' : 'Salvar'}</button>
          </form>
        )}
      </Modal>
    </>
  )
}
