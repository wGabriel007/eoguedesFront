import { motion } from 'framer-motion'
import { useState } from 'react'
import { z } from 'zod'
import { enviarJson, urlApi } from '../../lib/api'
import { texto, useFormulario } from '../../lib/formularios'
import type { Artista } from '../../lib/tipos'
import { AreaTexto, Campo, Honeypot, TituloSecao } from '../ui/Basicos'
import { IconeCheck, IconeDownload } from '../ui/Icones'
import { Redes, SECOES } from './Cabecalho'
import { rolarPara } from '../../hooks/uteis'

const esquema = z.object({
  nome: texto(1, 120, 'Nome'),
  email: z.email('E-mail inválido.'),
  tipo: z.enum(['Contato', 'Imprensa']),
  mensagem: texto(5, 3000, 'Mensagem'),
  site: z.string().optional(),
})

export function Contato({ artista }: { artista: Artista }) {
  const f = useFormulario(esquema, { defaultValues: { tipo: 'Contato' } })
  const [enviado, setEnviado] = useState(false)
  const e = f.formState.errors

  return (
    <section id="contato" className="relative isolate overflow-hidden bg-fundo py-24 sm:py-32">
      <div className="absolute -right-[25vw] top-0 -z-10 hidden h-full w-[60vw] rounded-l-full bg-superficie lg:block" aria-hidden />
      {artista.urlRecorteArtista && (
        <img src={artista.urlRecorteArtista} alt="" aria-hidden loading="lazy"
             className="pointer-events-none absolute bottom-0 right-[4vw] -z-10 hidden h-[80%] max-w-[34vw] object-contain object-bottom lg:block" />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-xl">
          <TituloSecao subtitulo="Fã, imprensa ou parceria: manda sua mensagem.">contato</TituloSecao>
          {enviado ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-superficie p-8">
              <span className="grid size-14 place-items-center rounded-full bg-secundaria text-sobre-secundaria"><IconeCheck width={28} height={28} /></span>
              <p className="mt-4 font-display text-4xl uppercase">Mensagem enviada!</p>
              <p className="mt-2 opacity-75">Valeu pelo contato. A resposta chega no seu e-mail.</p>
              <button className="mt-6 text-sm underline opacity-70" onClick={() => { f.reset(); setEnviado(false) }}>Enviar outra</button>
            </motion.div>
          ) : (
            <form onSubmit={f.enviar(async (d) => { await enviarJson('/api/contato', d); setEnviado(true) })} className="space-y-4" noValidate>
              <Honeypot {...f.register('site')} />
              <fieldset className="flex gap-2" aria-label="Assunto">
                {(['Contato', 'Imprensa'] as const).map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" value={t} className="peer sr-only" {...f.register('tipo')} />
                    <span className="block rounded-full px-5 py-2 text-sm font-semibold ring-1 ring-current/20 transition peer-checked:bg-primaria peer-checked:text-sobre-primaria peer-checked:ring-primaria peer-focus-visible:outline-2 peer-focus-visible:outline-secundaria">
                      {t === 'Contato' ? 'Fã / geral' : 'Imprensa'}
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Nome" autoComplete="name" {...f.register('nome')} erro={e.nome?.message} />
                <Campo rotulo="E-mail" type="email" autoComplete="email" {...f.register('email')} erro={e.email?.message} />
              </div>
              <AreaTexto rotulo="Mensagem" {...f.register('mensagem')} erro={e.mensagem?.message} />
              {f.erroGeral && <p className="text-sm font-medium text-red-400">{f.erroGeral}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <button disabled={f.formState.isSubmitting} className="botao-primario">{f.formState.isSubmitting ? 'Enviando…' : 'Enviar mensagem'}</button>
                <a href={urlApi('/api/presskit')} className="botao-contorno" download><IconeDownload /> Press kit</a>
              </div>
            </form>
          )}
          {artista.emailContato && (
            <p className="mt-8 text-sm opacity-70">Ou escreva para <a href={`mailto:${artista.emailContato}`} className="font-semibold underline">{artista.emailContato}</a></p>
          )}
        </div>
      </div>
    </section>
  )
}

export function Rodape({ artista }: { artista: Artista }) {
  return (
    <footer className="border-t border-white/5 bg-black px-4 pb-32 pt-16 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-6xl uppercase sm:text-8xl">{artista.nomeArtistico}</p>
          <p className="mt-2 text-white/60">{artista.fraseDeImpacto ?? 'Brega funk'} · {artista.bairro}, {artista.cidade}</p>
          <Redes artista={artista} className="mt-6 -ml-2" />
        </div>
        <nav aria-label="Rodapé">
          <p className="rotulo text-white/70">Navegue</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {SECOES.map((s) => <li key={s.id}><button onClick={() => rolarPara(s.id)} className="hover:text-primaria">{s.rotulo}</button></li>)}
          </ul>
        </nav>
        <div className="text-sm">
          <p className="rotulo text-white/70">Contratantes</p>
          <a href={urlApi('/api/presskit')} className="flex items-center gap-2 font-semibold hover:text-primaria"><IconeDownload width={16} /> Baixar press kit</a>
          <button onClick={() => rolarPara('contrate')} className="mt-2 font-semibold hover:text-primaria">Pedir orçamento</button>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs text-white/65">© {new Date().getFullYear()} {artista.nomeArtistico}. Feito com orgulho no {artista.bairro}.</p>
    </footer>
  )
}
