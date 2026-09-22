import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BotaoExcluir, CabecalhoPagina, Cartao, MensagemErro, useAcao, Vazio } from '../../componentes/admin/Kit'
import { Campo } from '../../componentes/ui/Basicos'
import { IconeLapis, IconeMais } from '../../componentes/ui/Icones'
import { Modal } from '../../componentes/ui/Modal'
import { api, enviarJson } from '../../lib/api'
import { isoParaLocal, localParaIso, partesData } from '../../lib/formatos'
import type { Show } from '../../lib/tipos'

interface FormShow { id?: string; dataHora: string; nomeEvento: string; local: string; cidade: string; endereco: string; linkMapa: string; linkIngresso: string }
const VAZIO: FormShow = { dataHora: '', nomeEvento: '', local: '', cidade: '', endereco: '', linkMapa: '', linkIngresso: '' }

const ETIQUETA: Record<Show['status'], string> = { Agendado: 'bg-secundaria/20 text-secundaria', Realizado: 'bg-white/10 text-texto-suave', Cancelado: 'bg-red-500/15 text-red-400' }

export function PaginaAgenda() {
  const { data: shows = [], isLoading } = useQuery({ queryKey: ['admin', 'shows'], queryFn: () => api<Show[]>('/api/admin/shows') })
  const [form, setForm] = useState<FormShow | null>(null)
  const [agora] = useState(() => Date.now())

  const salvar = useAcao(async (f: FormShow) => {
    const corpo = { ...f, dataHora: localParaIso(f.dataHora), endereco: f.endereco || null, linkMapa: f.linkMapa || null, linkIngresso: f.linkIngresso || null }
    if (f.id) await enviarJson(`/api/admin/shows/${f.id}`, corpo, 'PUT')
    else await enviarJson('/api/admin/shows', corpo)
  })
  const excluir = useAcao((id: string) => api(`/api/admin/shows/${id}`, { method: 'DELETE' }))
  const status = useAcao(({ id, acao }: { id: string; acao: 'cancelar' | 'reativar' }) => api(`/api/admin/shows/${id}/${acao}`, { method: 'POST' }))

  const editar = (s: Show) => setForm({
    id: s.id, dataHora: isoParaLocal(s.dataHora), nomeEvento: s.nomeEvento, local: s.local, cidade: s.cidade,
    endereco: s.endereco ?? '', linkMapa: s.linkComoChegar?.includes('maps/search') ? '' : s.linkComoChegar ?? '', linkIngresso: s.linkIngresso ?? '',
  })
  const campo = (k: keyof FormShow) => ({ value: form?.[k] ?? '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form!, [k]: e.target.value }) })

  return (
    <>
      <CabecalhoPagina titulo="Agenda" descricao="O próximo show vira a contagem regressiva do site. Horários no fuso de Recife."
                       acao={<button onClick={() => setForm(VAZIO)} className="botao-primario"><IconeMais /> Novo show</button>} />
      <MensagemErro erro={excluir.erro ?? status.erro} />
      {isLoading ? null : shows.length === 0 ? <Vazio>Nenhum show cadastrado ainda.</Vazio> : (
        <div className="space-y-3">
          {shows.map((s) => {
            const d = partesData(s.dataHora)
            const passou = new Date(s.dataHora).getTime() < agora
            return (
              <Cartao key={s.id} className={`flex flex-wrap items-center gap-4 ${passou ? 'opacity-60' : ''}`}>
                <div className="w-16 text-center"><p className="font-display text-4xl leading-none">{d.dia}</p><p className="text-xs font-bold">{d.mes} {d.ano}</p></div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl uppercase">{s.nomeEvento}</p>
                  <p className="text-sm text-texto-suave">{d.hora} · {s.local} · {s.cidade}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${ETIQUETA[s.status]}`}>{passou && s.status === 'Agendado' ? 'Já aconteceu' : s.status}</span>
                <div className="flex items-center gap-2">
                  {!passou && s.status === 'Agendado' && <button onClick={() => status.mutate({ id: s.id, acao: 'cancelar' })} className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">Cancelar show</button>}
                  {s.status === 'Cancelado' && <button onClick={() => status.mutate({ id: s.id, acao: 'reativar' })} className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">Reativar</button>}
                  <button onClick={() => editar(s)} aria-label="Editar" className="grid size-9 place-items-center rounded-full ring-1 ring-white/15 hover:bg-white/5"><IconeLapis width={16} /></button>
                  <BotaoExcluir aoConfirmar={() => excluir.mutate(s.id)} />
                </div>
              </Cartao>
            )
          })}
        </div>
      )}

      <Modal aberto={!!form} aoFechar={() => setForm(null)} titulo={form?.id ? 'Editar show' : 'Novo show'}>
        {form && (
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); salvar.mutate(form, { onSuccess: () => setForm(null) }) }}>
            <Campo rotulo="Nome do evento" required className="sm:col-span-2" {...campo('nomeEvento')} />
            <Campo rotulo="Data e hora" type="datetime-local" required {...campo('dataHora')} />
            <Campo rotulo="Cidade" required {...campo('cidade')} />
            <Campo rotulo="Local" required placeholder="Ex.: Praça do Caetés" {...campo('local')} />
            <Campo rotulo="Endereço (gera o botão 'Como chegar')" {...campo('endereco')} />
            <Campo rotulo="Link do mapa (opcional)" type="url" {...campo('linkMapa')} />
            <Campo rotulo="Link de ingressos (opcional)" type="url" {...campo('linkIngresso')} />
            <div className="sm:col-span-2"><MensagemErro erro={salvar.erro} /></div>
            <button disabled={salvar.isPending} className="botao-primario sm:col-span-2">{salvar.isPending ? 'Salvando…' : 'Salvar'}</button>
          </form>
        )}
      </Modal>
    </>
  )
}
