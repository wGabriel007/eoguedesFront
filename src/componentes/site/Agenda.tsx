import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { urlApi } from '../../lib/api'
import { useShows } from '../../lib/consultas'
import { partesData } from '../../lib/formatos'
import type { Show } from '../../lib/tipos'
import { Carregando, TituloSecao } from '../ui/Basicos'
import { IconeCalendario, IconeIngresso, IconeMapa } from '../ui/Icones'
import { Modal } from '../ui/Modal'

function useContagem(alvoIso?: string) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!alvoIso) return
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [alvoIso])
  if (!alvoIso) return null
  const resto = Math.max(0, new Date(alvoIso).getTime() - agora)
  return {
    dias: Math.floor(resto / 86_400_000),
    horas: Math.floor((resto / 3_600_000) % 24),
    minutos: Math.floor((resto / 60_000) % 60),
    segundos: Math.floor((resto / 1000) % 60),
    acontecendo: resto === 0,
  }
}

function AdicionarAgenda({ show }: { show: Show }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="botao-contorno">
        <IconeCalendario /> Adicionar à agenda
      </button>
      {aberto && (
        <div className="absolute left-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-2xl bg-fundo text-texto shadow-2xl ring-1 ring-white/10">
          <a href={show.linkGoogleAgenda} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 text-sm font-semibold hover:bg-white/5" onClick={() => setAberto(false)}>Google Agenda</a>
          <a href={urlApi(`/api/shows/${show.id}/ics`)} className="block px-5 py-3 text-sm font-semibold hover:bg-white/5" onClick={() => setAberto(false)}>iPhone / Outlook (.ics)</a>
        </div>
      )}
    </div>
  )
}

/** Contagem regressiva gigante para o próximo show. */
function ProximoShow({ show }: { show: Show }) {
  const c = useContagem(show.dataHora)!
  const d = partesData(show.dataHora)
  const blocos = [
    { v: c.dias, r: 'dias' }, { v: c.horas, r: 'horas' }, { v: c.minutos, r: 'min' }, { v: c.segundos, r: 'seg' },
  ]
  return (
    <motion.div className="relative overflow-hidden rounded-[2rem] bg-sobre-claro p-6 text-claro sm:p-10"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primaria/30 blur-3xl" aria-hidden />
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-secundaria">{c.acontecendo ? 'É hoje! Acontecendo agora' : 'Próximo show em'}</p>
      {!c.acontecendo && (
        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="off"
             aria-label={`Faltam ${c.dias} dias, ${c.horas} horas e ${c.minutos} minutos`}>
          {blocos.map((b) => (
            <div key={b.r} className="rounded-2xl bg-white/5 px-2 py-3 text-center ring-1 ring-white/10 sm:py-5">
              <span className="block font-display text-[clamp(2.2rem,9vw,5.5rem)] leading-none tabular-nums">{String(b.v).padStart(2, '0')}</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.25em] opacity-60 sm:text-xs">{b.r}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-col gap-1">
        <h3 className="text-3xl sm:text-5xl">{show.nomeEvento}</h3>
        <p className="text-base opacity-75 sm:text-lg">{d.semana}, {d.dia} {d.mes} · {d.hora} · {show.local} · {show.cidade}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {show.linkIngresso && <a href={show.linkIngresso} target="_blank" rel="noopener noreferrer" className="botao-primario"><IconeIngresso /> Ingressos</a>}
        <AdicionarAgenda show={show} />
        {show.linkComoChegar && <a href={show.linkComoChegar} target="_blank" rel="noopener noreferrer" className="botao-contorno"><IconeMapa /> Como chegar</a>}
      </div>
    </motion.div>
  )
}

function LinhaShow({ show, passado = false }: { show: Show; passado?: boolean }) {
  const d = partesData(show.dataHora)
  return (
    <li className="group grid grid-cols-[auto_1fr] items-center gap-4 border-b border-current/15 py-5 sm:grid-cols-[auto_1fr_auto] sm:gap-8">
      <div className="w-20 text-center sm:w-24">
        <span className="block font-display text-5xl leading-none sm:text-6xl">{d.dia}</span>
        <span className="text-xs font-bold tracking-[0.2em] opacity-70">{d.mes} {passado ? d.ano : ''}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-2xl uppercase transition group-hover:text-primaria sm:text-3xl">{show.nomeEvento}</p>
        <p className="text-sm opacity-70">{show.local} · {show.cidade}{passado ? '' : ` · ${d.hora}`}</p>
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        {show.linkComoChegar && (
          <a href={show.linkComoChegar} target="_blank" rel="noopener noreferrer" aria-label={`Mapa de ${show.local}`}
             className="grid size-11 place-items-center rounded-full ring-1 ring-current/20 hover:bg-current/10"><IconeMapa /></a>
        )}
        {!passado && show.linkIngresso && (
          <a href={show.linkIngresso} target="_blank" rel="noopener noreferrer" className="botao-primario py-2.5">Ingressos</a>
        )}
      </div>
    </li>
  )
}

export function Agenda() {
  const { data: proximos, isLoading } = useShows('proximos')
  const [anterioresAberto, setAnterioresAberto] = useState(false)
  const { data: anteriores, isLoading: carregandoAnteriores } = useShows('anteriores', anterioresAberto)
  const [primeiro, ...demais] = proximos ?? []

  return (
    <section id="agenda" className="relative bg-claro py-24 text-sobre-claro sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <TituloSecao>agenda</TituloSecao>
        {isLoading ? <Carregando /> : !primeiro ? (
          <div className="rounded-3xl border-2 border-dashed border-current/20 p-10 text-center">
            <p className="font-display text-3xl uppercase">Nenhum show agendado</p>
            <p className="mt-2 opacity-70">Novas datas em breve. Siga nas redes para saber primeiro.</p>
          </div>
        ) : (
          <>
            <ProximoShow show={primeiro} />
            {demais.length > 0 && <ul className="mt-10">{demais.map((s) => <LinhaShow key={s.id} show={s} />)}</ul>}
          </>
        )}
        <div className="mt-10 text-center">
          <button onClick={() => setAnterioresAberto(true)} className="botao-contorno">Eventos anteriores</button>
        </div>
      </div>

      <Modal aberto={anterioresAberto} aoFechar={() => setAnterioresAberto(false)} titulo="#eventos anteriores" variante="claro" largura="max-w-3xl">
        {carregandoAnteriores ? <Carregando /> : anteriores?.length ? (
          <ul>{anteriores.map((s) => <LinhaShow key={s.id} show={s} passado />)}</ul>
        ) : <p className="opacity-70">Ainda não há eventos anteriores cadastrados.</p>}
      </Modal>
    </section>
  )
}
