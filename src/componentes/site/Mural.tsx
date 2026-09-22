import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { z } from 'zod'
import { enviarJson } from '../../lib/api'
import { useRecados } from '../../lib/consultas'
import { tempoRelativo } from '../../lib/formatos'
import { texto, useFormulario } from '../../lib/formularios'
import { AreaTexto, Campo, Honeypot, TituloSecao } from '../ui/Basicos'
import { IconeCheck } from '../ui/Icones'
import { Modal } from '../ui/Modal'

const CORES_PAPEL = ['bg-secundaria text-sobre-secundaria', 'bg-primaria text-sobre-primaria', 'bg-claro text-sobre-claro', 'bg-[#7dd3fc] text-black', 'bg-[#fdba74] text-black']
const GIROS = [-4, 2.5, -1.5, 3.5, -3, 1.5]

const esquema = z.object({
  nome: texto(1, 60, 'Nome'),
  bairroCidade: z.string().max(120).optional(),
  mensagem: texto(3, 280, 'Recado').refine((m) => !/https?:|www\./i.test(m), 'Links não são permitidos no mural.'),
  site: z.string().optional(),
})

function FormRecado({ aoEnviar }: { aoEnviar: () => void }) {
  const f = useFormulario(esquema)
  const mensagem = f.watch('mensagem') ?? ''
  return (
    <form onSubmit={f.enviar(async (d) => { await enviarJson('/api/recados', d); aoEnviar() })} className="space-y-4" noValidate>
      <Honeypot {...f.register('site')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Seu nome" autoComplete="given-name" {...f.register('nome')} erro={f.formState.errors.nome?.message} />
        <Campo rotulo="Bairro / cidade" placeholder="Opcional" {...f.register('bairroCidade')} erro={f.formState.errors.bairroCidade?.message} />
      </div>
      <AreaTexto rotulo={`Recado (${mensagem.length}/280)`} maxLength={280} {...f.register('mensagem')} erro={f.formState.errors.mensagem?.message} />
      {f.erroGeral && <p className="text-sm font-medium text-red-400">{f.erroGeral}</p>}
      <button disabled={f.formState.isSubmitting} className="botao-primario w-full">{f.formState.isSubmitting ? 'Colando no muro…' : 'Colar no muro'}</button>
      <p className="text-center text-xs opacity-60">Os recados passam por aprovação antes de aparecer.</p>
    </form>
  )
}

export function Mural() {
  const { data: recados = [] } = useRecados()
  const [aberto, setAberto] = useState(false)
  const [enviado, setEnviado] = useState(false)

  return (
    <section id="mural" className="parede relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <TituloSecao subtitulo="O muro é dos fãs. Deixe seu recado: depois de aprovado, ele fica colado aqui.">mural</TituloSecao>
          <button onClick={() => { setEnviado(false); setAberto(true) }} className="botao-secundario mb-10" data-cursor="grande">Deixar recado</button>
        </div>

        {recados.length === 0 ? (
          <p className="text-lg opacity-80">O muro ainda está vazio. Seja o primeiro!</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recados.map((r, i) => (
              <motion.li key={r.id} className={`lambe relative p-6 pt-8 ${CORES_PAPEL[i % CORES_PAPEL.length]}`}
                         style={{ rotate: GIROS[i % GIROS.length] }}
                         initial={{ opacity: 0, y: 30, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                         whileHover={{ rotate: 0, scale: 1.03, zIndex: 2 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}>
                {/* fita adesiva */}
                <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-white/50 backdrop-blur-sm" aria-hidden />
                <p className="font-display text-2xl uppercase leading-tight">“{r.mensagem}”</p>
                <p className="mt-4 text-sm font-semibold opacity-80">
                  {r.nome}{r.bairroCidade ? ` · ${r.bairroCidade}` : ''} <span className="font-normal opacity-70">· {tempoRelativo(r.criadoEm)}</span>
                </p>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo={enviado ? undefined : 'Deixe seu recado'} largura="max-w-lg">
        <AnimatePresence mode="wait">
          {enviado ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-secundaria text-sobre-secundaria"><IconeCheck width={32} height={32} /></span>
              <p className="mt-4 font-display text-4xl uppercase">Recado enviado!</p>
              <p className="mt-2 opacity-75">Assim que for aprovado, ele aparece no muro.</p>
              <button onClick={() => setAberto(false)} className="botao-contorno mt-6">Fechar</button>
            </motion.div>
          ) : (
            <motion.div key="form"><FormRecado aoEnviar={() => setEnviado(true)} /></motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </section>
  )
}
