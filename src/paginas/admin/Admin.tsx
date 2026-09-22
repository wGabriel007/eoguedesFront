import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { z } from 'zod'
import { SessaoProvider, useSessao } from '../../contextos/Sessao'
import { Campo } from '../../componentes/ui/Basicos'
import { IconeFechar, IconeMenu } from '../../componentes/ui/Icones'
import { api, ErroApi } from '../../lib/api'
import { useArtista } from '../../lib/consultas'
import { partesData } from '../../lib/formatos'
import { useFormulario } from '../../lib/formularios'
import type { ResumoPainel } from '../../lib/tipos'
import { Cartao, CabecalhoPagina } from '../../componentes/admin/Kit'
import { PaginaAgenda } from './PaginaAgenda'
import { PaginaArtista } from './PaginaArtista'
import { PaginaCaixa } from './PaginaCaixa'
import { PaginaClipes, PaginaTrajetoria } from './PaginaClipes'
import { PaginaConta } from './PaginaConta'
import { PaginaDiscografia } from './PaginaDiscografia'
import { PaginaFotos } from './PaginaFotos'

export default function Admin() {
  return (
    <SessaoProvider>
      <PortaDoPainel />
    </SessaoProvider>
  )
}

function PortaDoPainel() {
  const { sessao } = useSessao()
  // O painel fica sempre no tema padrão, independente da paleta escolhida para o site.
  useEffect(() => {
    document.documentElement.dataset.tema = 'paredao'
    document.documentElement.dataset.fonte = 'impacto'
    document.title = 'Painel'
  }, [])
  return sessao ? <Layout /> : <Login />
}

// ------------------------------------------------------------------ Login
const esquemaLogin = z.object({ email: z.email('E-mail inválido.'), senha: z.string().min(1, 'Informe a senha.') })

function Login() {
  const { entrar } = useSessao()
  const f = useFormulario(esquemaLogin)
  const [erro, setErro] = useState<string | null>(null)

  const enviar = f.handleSubmit(async ({ email, senha }) => {
    setErro(null)
    try { await entrar(email, senha) } catch (e) { setErro(e instanceof ErroApi ? e.message : 'Não foi possível entrar.') }
  })

  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_at_top,#2a0f22,var(--color-fundo))] p-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-3xl bg-superficie p-8 shadow-2xl ring-1 ring-white/5" noValidate>
        <p className="font-display text-5xl uppercase">Painel</p>
        <p className="-mt-2 text-sm text-texto-suave">Entre para atualizar o site.</p>
        <Campo rotulo="E-mail" type="email" autoComplete="username" {...f.register('email')} erro={f.formState.errors.email?.message} />
        <Campo rotulo="Senha" type="password" autoComplete="current-password" {...f.register('senha')} erro={f.formState.errors.senha?.message} />
        {erro && <p role="alert" className="text-sm font-medium text-red-400">{erro}</p>}
        <button disabled={f.formState.isSubmitting} className="botao-primario w-full">{f.formState.isSubmitting ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="block text-center text-xs text-texto-suave underline">Voltar ao site</Link>
      </form>
    </main>
  )
}

// ------------------------------------------------------------------ Layout
const MENU = [
  { para: '', rotulo: 'Início', fim: true },
  { para: 'artista', rotulo: 'Artista e aparência' },
  { para: 'agenda', rotulo: 'Agenda' },
  { para: 'discografia', rotulo: 'Discografia' },
  { para: 'clipes', rotulo: 'Clipes' },
  { para: 'fotos', rotulo: 'Fotos' },
  { para: 'trajetoria', rotulo: 'Trajetória' },
  { para: 'recados', rotulo: 'Recados', contador: 'recadosPendentes' as const },
  { para: 'mensagens', rotulo: 'Mensagens', contador: 'mensagensNaoLidas' as const },
  { para: 'contratacoes', rotulo: 'Contratações', contador: 'pedidosAbertos' as const },
  { para: 'conta', rotulo: 'Minha conta' },
]

const useResumo = () => useQuery({ queryKey: ['admin', 'resumo'], queryFn: () => api<ResumoPainel>('/api/admin/resumo') })

function Layout() {
  const { sessao, sair } = useSessao()
  const { data: resumo } = useResumo()
  const [menuAberto, setMenuAberto] = useState(false)

  const navegacao = (
    <nav className="flex flex-col gap-1" aria-label="Painel">
      {MENU.map((m) => {
        const n = m.contador ? resumo?.[m.contador] ?? 0 : 0
        return (
          <NavLink key={m.para} to={`/admin/${m.para}`} end={m.fim} onClick={() => setMenuAberto(false)}
                   className={({ isActive }) => `flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primaria text-sobre-primaria' : 'hover:bg-white/5'}`}>
            {m.rotulo}
            {n > 0 && <span className="rounded-full bg-secundaria px-2 py-0.5 text-[11px] font-bold text-sobre-secundaria">{n}</span>}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-fundo lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-white/5 p-4 lg:flex">
        <div>
          <p className="mb-6 px-4 font-display text-3xl uppercase">Painel</p>
          {navegacao}
        </div>
        <Rodape nome={sessao!.nome} sair={sair} />
      </aside>

      {/* Barra do celular */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-fundo/90 px-4 py-3 backdrop-blur lg:hidden">
        <p className="font-display text-2xl uppercase">Painel</p>
        <button onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="grid size-10 place-items-center rounded-full bg-white/10"><IconeMenu /></button>
      </header>
      {menuAberto && (
        <div className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-fundo p-4 lg:hidden">
          <div>
            <div className="mb-4 flex justify-end"><button onClick={() => setMenuAberto(false)} aria-label="Fechar" className="grid size-10 place-items-center rounded-full bg-white/10"><IconeFechar /></button></div>
            {navegacao}
          </div>
          <Rodape nome={sessao!.nome} sair={sair} />
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-8 lg:p-10">
        <Routes>
          <Route index element={<Inicio resumo={resumo} />} />
          <Route path="artista" element={<PaginaArtista />} />
          <Route path="agenda" element={<PaginaAgenda />} />
          <Route path="discografia" element={<PaginaDiscografia />} />
          <Route path="clipes" element={<PaginaClipes />} />
          <Route path="fotos" element={<PaginaFotos />} />
          <Route path="trajetoria" element={<PaginaTrajetoria />} />
          <Route path="recados" element={<PaginaCaixa aba="recados" />} />
          <Route path="mensagens" element={<PaginaCaixa aba="mensagens" />} />
          <Route path="contratacoes" element={<PaginaCaixa aba="contratacoes" />} />
          <Route path="conta" element={<PaginaConta />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Rodape({ nome, sair }: { nome: string; sair: () => void }) {
  return (
    <div className="space-y-2 border-t border-white/5 px-4 pt-4 text-sm">
      <p className="text-texto-suave">Logado como <strong className="text-texto">{nome}</strong></p>
      <div className="flex gap-4">
        <Link to="/" target="_blank" className="underline">Ver site</Link>
        <button onClick={sair} className="underline">Sair</button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ Início do painel
function Inicio({ resumo }: { resumo?: ResumoPainel }) {
  const { data: artista } = useArtista()
  const cards = [
    { n: resumo?.recadosPendentes, rotulo: 'recados esperando aprovação', para: 'recados', destaque: true },
    { n: resumo?.mensagensNaoLidas, rotulo: 'mensagens não lidas', para: 'mensagens', destaque: true },
    { n: resumo?.pedidosAbertos, rotulo: 'pedidos de contratação', para: 'contratacoes', destaque: true },
    { n: resumo?.proximosShows, rotulo: 'shows agendados', para: 'agenda' },
    { n: resumo?.lancamentos, rotulo: 'lançamentos', para: 'discografia' },
    { n: resumo?.clipes, rotulo: 'clipes', para: 'clipes' },
    { n: resumo?.fotos, rotulo: 'fotos na galeria', para: 'fotos' },
  ]
  const proximo = resumo?.proximoShow ? partesData(resumo.proximoShow.dataHora) : null

  return (
    <>
      <CabecalhoPagina titulo={`Salve${artista ? `, ${artista.nomeArtistico}` : ''}!`} descricao="Tudo o que você alterar aqui aparece no site na hora." />
      {proximo && resumo?.proximoShow && (
        <Cartao className="mb-6 bg-gradient-to-r from-primaria/30 to-transparent">
          <p className="rotulo text-secundaria">Próximo show</p>
          <p className="font-display text-3xl uppercase">{resumo.proximoShow.nomeEvento}</p>
          <p className="text-texto-suave">{proximo.semana}, {proximo.dia} {proximo.mes} · {proximo.hora} · {resumo.proximoShow.local}</p>
        </Cartao>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.rotulo} to={`/admin/${c.para}`}
                className={`rounded-2xl p-5 ring-1 transition hover:-translate-y-0.5 ${c.destaque && c.n ? 'bg-secundaria/10 ring-secundaria/40' : 'bg-superficie ring-white/5'}`}>
            <p className="font-display text-5xl">{c.n ?? '–'}</p>
            <p className="text-sm text-texto-suave">{c.rotulo}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
