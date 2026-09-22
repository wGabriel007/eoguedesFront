import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BotaoExcluir, CabecalhoPagina, Cartao, MensagemErro, useAcao, Vazio } from '../../componentes/admin/Kit'
import { IconeCheck, IconeWhatsApp } from '../../componentes/ui/Icones'
import { api } from '../../lib/api'
import { dataSemFuso, tempoRelativo } from '../../lib/formatos'
import type { Mensagem, PedidoContratacao, Recado } from '../../lib/tipos'

/** Tudo que chega dos fãs: recados para aprovar, mensagens e pedidos de contratação. */
export function PaginaCaixa({ aba }: { aba: 'recados' | 'mensagens' | 'contratacoes' }) {
  if (aba === 'recados') return <Recados />
  if (aba === 'mensagens') return <Mensagens />
  return <Contratacoes />
}

function Recados() {
  const [soPendentes, setSoPendentes] = useState(true)
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'recados', soPendentes],
    queryFn: () => api<Recado[]>(`/api/admin/recados?pendentes=${soPendentes}`),
  })
  const aprovar = useAcao((id: string) => api(`/api/admin/recados/${id}/aprovar`, { method: 'POST' }))
  const excluir = useAcao((id: string) => api(`/api/admin/recados/${id}`, { method: 'DELETE' }))

  return (
    <>
      <CabecalhoPagina titulo="Recados" descricao="Aprove o que pode ir para o mural. Excluir some com o recado para sempre."
                       acao={<div className="flex gap-2">{[true, false].map((v) => (
                         <button key={String(v)} aria-pressed={soPendentes === v} onClick={() => setSoPendentes(v)}
                                 className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/15 aria-pressed:bg-primaria aria-pressed:text-sobre-primaria">
                           {v ? 'Pendentes' : 'Todos'}
                         </button>))}</div>} />
      <MensagemErro erro={aprovar.erro ?? excluir.erro} />
      {isLoading ? null : data.length === 0 ? <Vazio>{soPendentes ? 'Nenhum recado esperando. Tudo em dia!' : 'Nenhum recado ainda.'}</Vazio> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((r) => (
            <Cartao key={r.id} className={r.aprovado ? 'opacity-70' : ''}>
              <p className="text-lg">“{r.mensagem}”</p>
              <p className="mt-2 text-sm text-texto-suave">{r.nome}{r.bairroCidade ? ` · ${r.bairroCidade}` : ''} · {tempoRelativo(r.criadoEm)}</p>
              <div className="mt-4 flex items-center gap-2">
                {r.aprovado ? <span className="text-sm font-semibold text-secundaria">✓ No mural</span>
                  : <button onClick={() => aprovar.mutate(r.id)} className="botao-secundario py-2"><IconeCheck width={16} /> Aprovar</button>}
                <BotaoExcluir aoConfirmar={() => excluir.mutate(r.id)} />
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </>
  )
}

function Mensagens() {
  const { data = [], isLoading } = useQuery({ queryKey: ['admin', 'mensagens'], queryFn: () => api<Mensagem[]>('/api/admin/mensagens') })
  const lida = useAcao((id: string) => api(`/api/admin/mensagens/${id}/lida`, { method: 'POST' }))
  return (
    <>
      <CabecalhoPagina titulo="Mensagens" descricao="Do formulário de contato. Responder abre seu e-mail já com o assunto." />
      <MensagemErro erro={lida.erro} />
      {isLoading ? null : data.length === 0 ? <Vazio>Nenhuma mensagem ainda.</Vazio> : (
        <div className="space-y-3">
          {data.map((m) => (
            <Cartao key={m.id} className={m.lida ? 'opacity-60' : 'ring-primaria/40'}>
              <div className="flex flex-wrap items-center gap-2">
                {!m.lida && <span className="size-2 rounded-full bg-primaria" aria-label="não lida" />}
                <p className="font-semibold">{m.nome}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m.tipo === 'Imprensa' ? 'bg-secundaria/20 text-secundaria' : 'bg-white/10'}`}>{m.tipo}</span>
                <span className="ml-auto text-xs text-texto-suave">{tempoRelativo(m.criadoEm)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-texto/85">{m.mensagem}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: sua mensagem pelo site')}`} onClick={() => !m.lida && lida.mutate(m.id)} className="botao-primario py-2">Responder por e-mail</a>
                {!m.lida && <button onClick={() => lida.mutate(m.id)} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/15">Marcar como lida</button>}
                <span className="self-center text-xs text-texto-suave">{m.email}{m.telefone ? ` · ${m.telefone}` : ''}</span>
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </>
  )
}

function Contratacoes() {
  const { data = [], isLoading } = useQuery({ queryKey: ['admin', 'contratacoes'], queryFn: () => api<PedidoContratacao[]>('/api/admin/contratacoes') })
  const respondido = useAcao((id: string) => api(`/api/admin/contratacoes/${id}/respondido`, { method: 'POST' }))
  return (
    <>
      <CabecalhoPagina titulo="Contratações" descricao="Pedidos de orçamento do site, em ordem de data do evento." />
      <MensagemErro erro={respondido.erro} />
      {isLoading ? null : data.length === 0 ? <Vazio>Nenhum pedido ainda.</Vazio> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((p) => (
            <Cartao key={p.id} className={p.respondido ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="rotulo mb-0 text-secundaria">{p.tipoEvento}</p>
                  <p className="font-display text-3xl uppercase">{dataSemFuso(p.dataEvento)} · {p.cidade}</p>
                </div>
                {p.quantidadeConvidados && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{p.quantidadeConvidados} pessoas</span>}
              </div>
              <p className="mt-2 font-semibold">{p.nome} <span className="font-normal text-texto-suave">· {p.telefone}{p.email ? ` · ${p.email}` : ''}</span></p>
              {p.observacoes && <p className="mt-2 whitespace-pre-line text-sm text-texto/80">{p.observacoes}</p>}
              <p className="mt-2 text-xs text-texto-suave">Recebido {tempoRelativo(p.criadoEm)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={p.linkWhatsAppCliente} target="_blank" rel="noopener noreferrer" className="botao bg-[#25D366] py-2 text-white"><IconeWhatsApp width={16} /> Chamar no WhatsApp</a>
                {!p.respondido && <button onClick={() => respondido.mutate(p.id)} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/15">Marcar como respondido</button>}
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </>
  )
}
