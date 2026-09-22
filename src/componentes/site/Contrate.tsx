import { motion } from 'framer-motion'
import { useState } from 'react'
import { z } from 'zod'
import { enviarJson } from '../../lib/api'
import { emailOpcional, telefone, texto, useFormulario } from '../../lib/formularios'
import type { Artista } from '../../lib/tipos'
import { AreaTexto, Campo, Honeypot, Selecao } from '../ui/Basicos'
import { IconeCheck, IconeWhatsApp } from '../ui/Icones'

const TIPOS_EVENTO = ['Aniversário', 'Casamento', 'Paredão / festa de rua', 'Formatura', 'Evento de empresa', 'Show em casa de show', 'Outro']

// Data de hoje no horário de Recife (formato do input date)
const hoje = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)

const esquema = z.object({
  nome: texto(1, 120, 'Nome'),
  telefone,
  email: emailOpcional,
  tipoEvento: texto(1, 80, 'Tipo de evento'),
  dataEvento: z.string().min(1, 'Informe a data.').refine((d) => d >= hoje(), 'A data precisa ser hoje ou no futuro.'),
  cidade: texto(1, 120, 'Cidade'),
  quantidadeConvidados: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
  site: z.string().optional(),
})

export function Contrate({ artista }: { artista: Artista }) {
  const f = useFormulario(esquema, { defaultValues: { tipoEvento: '' } })
  const [resultado, setResultado] = useState<{ link: string | null } | null>(null)
  const e = f.formState.errors

  const enviar = f.enviar(async (d) => {
    const resp = await enviarJson<{ linkWhatsApp: string | null }>('/api/contratacao', {
      ...d,
      email: d.email || null,
      quantidadeConvidados: d.quantidadeConvidados ? Number(d.quantidadeConvidados) : null,
    })
    setResultado({ link: resp.linkWhatsApp })
    if (resp.linkWhatsApp) window.open(resp.linkWhatsApp, '_blank', 'noopener')
  })

  return (
    <section id="contrate" className="relative overflow-hidden bg-primaria py-24 text-sobre-primaria sm:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(45deg,currentColor_0_2px,transparent_2px_22px)]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-[clamp(3rem,10vw,7rem)] leading-[0.85]">Contrate<br />{artista.nomeArtistico}</h2>
          <p className="mt-6 max-w-md text-lg opacity-90">
            Aniversário, casamento, paredão, festa da firma: conta pra gente como é o seu evento.
            O pedido chega direto para a produção e a conversa continua no WhatsApp.
          </p>
          <ul className="mt-8 space-y-3 text-base font-semibold">
            {['Resposta rápida pelo WhatsApp', 'Show completo ou participação especial', `Base em ${artista.cidade}, atende toda a região`].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-sobre-primaria text-primaria"><IconeCheck width={14} /></span>{t}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] bg-fundo p-6 text-texto shadow-2xl sm:p-10">
          {resultado ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-secundaria text-sobre-secundaria"><IconeCheck width={32} height={32} /></span>
              <p className="mt-4 font-display text-4xl uppercase">Pedido recebido!</p>
              <p className="mx-auto mt-2 max-w-sm opacity-75">
                {resultado.link ? 'Abrimos o WhatsApp com a mensagem pronta. Se não abriu, toque no botão abaixo.' : 'A produção vai entrar em contato pelo telefone informado.'}
              </p>
              {resultado.link && <a href={resultado.link} target="_blank" rel="noopener noreferrer" className="botao mt-6 bg-[#25D366] text-white"><IconeWhatsApp /> Continuar no WhatsApp</a>}
              <button onClick={() => { setResultado(null); f.reset() }} className="mt-4 block w-full text-sm underline opacity-70">Fazer outro pedido</button>
            </motion.div>
          ) : (
            <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Honeypot {...f.register('site')} />
              <Selecao rotulo="Tipo de evento" {...f.register('tipoEvento')} erro={e.tipoEvento?.message} className="sm:col-span-2">
                <option value="" disabled>Escolha…</option>
                {TIPOS_EVENTO.map((t) => <option key={t} className="bg-fundo">{t}</option>)}
              </Selecao>
              <Campo rotulo="Data" type="date" min={hoje()} {...f.register('dataEvento')} erro={e.dataEvento?.message} />
              <Campo rotulo="Cidade" autoComplete="address-level2" {...f.register('cidade')} erro={e.cidade?.message} />
              <Campo rotulo="Convidados (aprox.)" type="number" inputMode="numeric" min={1} {...f.register('quantidadeConvidados')} erro={e.quantidadeConvidados?.message} />
              <Campo rotulo="Seu nome" autoComplete="name" {...f.register('nome')} erro={e.nome?.message} />
              <Campo rotulo="WhatsApp / telefone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(81) 9…" {...f.register('telefone')} erro={e.telefone?.message} />
              <Campo rotulo="E-mail (opcional)" type="email" autoComplete="email" {...f.register('email')} erro={e.email?.message} />
              <AreaTexto rotulo="Conte mais (opcional)" className="sm:col-span-2" placeholder="Horário, local, se já tem som…" {...f.register('observacoes')} erro={e.observacoes?.message} />
              {f.erroGeral && <p className="text-sm font-medium text-red-400 sm:col-span-2">{f.erroGeral}</p>}
              <button disabled={f.formState.isSubmitting} className="botao-primario py-4 text-base sm:col-span-2" data-cursor="grande">
                {f.formState.isSubmitting ? 'Enviando…' : <><IconeWhatsApp /> Pedir orçamento</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
