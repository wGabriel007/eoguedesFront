import { useState } from 'react'
import { CabecalhoPagina, CampoMidia, Cartao, MensagemErro, useAcao } from '../../componentes/admin/Kit'
import { AreaTexto, Campo } from '../../componentes/ui/Basicos'
import { enviarJson } from '../../lib/api'
import { useArtista } from '../../lib/consultas'
import { FONTES, TEMAS, type FonteId, type TemaId } from '../../lib/tema'
import type { Artista } from '../../lib/tipos'

/** Miniatura do site em cada paleta: data-tema no próprio cartão, as cores valem só dentro dele. */
function PreviaTema({ tema, fonte, nome, ativo, aoEscolher }: { tema: TemaId; fonte: FonteId; nome: string; ativo: boolean; aoEscolher: () => void }) {
  const info = TEMAS.find((t) => t.id === tema)!
  return (
    <button type="button" onClick={aoEscolher} data-tema={tema} data-fonte={fonte} aria-pressed={ativo}
            className={`overflow-hidden rounded-2xl bg-fundo text-left font-corpo text-texto ring-2 transition ${ativo ? 'ring-primaria' : 'ring-transparent hover:ring-white/20'}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-superficie p-4">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primaria/50 blur-2xl" />
        <div className="absolute -bottom-10 -left-6 size-28 rounded-full bg-secundaria/40 blur-2xl" />
        <div className="relative flex h-full flex-col justify-end">
          <p className="font-display text-4xl uppercase leading-none">{nome}</p>
          <span className="mt-2 w-fit rounded-full bg-primaria px-3 py-1 text-[10px] font-bold uppercase text-sobre-primaria">Ouça agora</span>
        </div>
      </div>
      <div className="-rotate-2 bg-secundaria py-1 text-center font-display text-sm uppercase text-sobre-secundaria">#bregafunk ✦ do bairro pro palco</div>
      <div className="p-4">
        <p className="font-display text-xl uppercase">{info.nome} {ativo && '✓'}</p>
        <p className="text-xs text-texto-suave">{info.descricao}</p>
      </div>
    </button>
  )
}

export function PaginaArtista() {
  const { data } = useArtista()
  // O formulário só monta quando os dados chegam: o estado inicial já nasce preenchido.
  return data ? <FormArtista inicial={data} /> : null
}

function FormArtista({ inicial }: { inicial: Artista }) {
  const [f, setF] = useState<Artista>(inicial)
  const [salvo, setSalvo] = useState(false)
  const salvar = useAcao((a: Artista) => enviarJson('/api/admin/artista', a, 'PUT'))

  const mudar = <K extends keyof Artista>(k: K, v: Artista[K]) => { setSalvo(false); setF({ ...f, [k]: v }) }
  const rede = (k: keyof Artista['redes'], v: string) => mudar('redes', { ...f.redes, [k]: v || null })

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar.mutate(f, { onSuccess: () => setSalvo(true) }) }} className="space-y-6 pb-24">
      <CabecalhoPagina titulo="Artista e aparência" descricao="Textos, contatos, redes, vídeo de abertura e a cara do site." />

      <Cartao className="space-y-4">
        <h2 className="text-2xl">Textos</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo rotulo="Nome artístico" value={f.nomeArtistico} onChange={(e) => mudar('nomeArtistico', e.target.value)} />
          <Campo rotulo="Bairro" value={f.bairro} onChange={(e) => mudar('bairro', e.target.value)} />
          <Campo rotulo="Cidade" value={f.cidade} onChange={(e) => mudar('cidade', e.target.value)} />
        </div>
        <Campo rotulo="Frase de impacto (aparece no topo)" value={f.fraseDeImpacto ?? ''} onChange={(e) => mudar('fraseDeImpacto', e.target.value)} />
        <AreaTexto rotulo={`Bio curta (${f.bioCurta.length}/600): aparece na seção biografia`} maxLength={600} value={f.bioCurta} onChange={(e) => mudar('bioCurta', e.target.value)} />
        <AreaTexto rotulo="Bio completa: aparece no &quot;ver mais&quot; e no press kit" className="[&_textarea]:min-h-60" value={f.bioCompleta} onChange={(e) => mudar('bioCompleta', e.target.value)} />
      </Cartao>

      <Cartao className="space-y-4">
        <h2 className="text-2xl">Contato e redes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="WhatsApp (com DDI e DDD)" placeholder="5581999999999" inputMode="tel" value={f.whatsApp ?? ''} onChange={(e) => mudar('whatsApp', e.target.value || null)} />
          <Campo rotulo="E-mail de contato" type="email" value={f.emailContato ?? ''} onChange={(e) => mudar('emailContato', e.target.value || null)} />
          <Campo rotulo="Instagram (link)" value={f.redes.instagram ?? ''} onChange={(e) => rede('instagram', e.target.value)} />
          <Campo rotulo="TikTok (link)" value={f.redes.tikTok ?? ''} onChange={(e) => rede('tikTok', e.target.value)} />
          <Campo rotulo="YouTube (link)" value={f.redes.youTube ?? ''} onChange={(e) => rede('youTube', e.target.value)} />
          <Campo rotulo="Spotify (link)" value={f.redes.spotify ?? ''} onChange={(e) => rede('spotify', e.target.value)} />
          <Campo rotulo="Facebook (link)" value={f.redes.facebook ?? ''} onChange={(e) => rede('facebook', e.target.value)} />
        </div>
      </Cartao>

      <Cartao className="space-y-4">
        <h2 className="text-2xl">Mídias da página</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <CampoMidia rotulo="Vídeo de abertura (16:9, sem áudio, até ~8 MB)" finalidade="Video" valor={f.urlVideoHero} aoMudar={(u) => mudar('urlVideoHero', u)} />
          <CampoMidia rotulo="Imagem de capa (aparece enquanto o vídeo carrega)" finalidade="Imagem" valor={f.urlPosterHero} aoMudar={(u) => mudar('urlPosterHero', u)} maxLado={1920} />
          <CampoMidia rotulo="Recorte do artista (PNG sem fundo)" finalidade="Imagem" valor={f.urlRecorteArtista} aoMudar={(u) => mudar('urlRecorteArtista', u)} dica="Use PNG com fundo transparente" />
          <CampoMidia rotulo="Rider técnico (PDF para o press kit)" finalidade="Documento" valor={f.urlRiderTecnico} aoMudar={(u) => mudar('urlRiderTecnico', u)} />
        </div>
      </Cartao>

      <Cartao className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">Cara do site</h2>
          <div className="flex gap-2" role="group" aria-label="Fontes">
            {FONTES.map((fo) => (
              <button key={fo.id} type="button" onClick={() => mudar('fonte', fo.id)} aria-pressed={f.fonte === fo.id}
                      className="rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-white/15 aria-pressed:bg-primaria aria-pressed:text-sobre-primaria">
                {fo.nome} · {fo.descricao}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TEMAS.map((t) => (
            <PreviaTema key={t.id} tema={t.id} fonte={f.fonte as FonteId} nome={f.nomeArtistico} ativo={f.tema === t.id} aoEscolher={() => mudar('tema', t.id)} />
          ))}
        </div>
      </Cartao>

      {/* Barra de salvar fixa no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-fundo/90 p-4 backdrop-blur lg:left-[260px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-4">
          <MensagemErro erro={salvar.erro} />
          {salvo && <span className="text-sm font-semibold text-secundaria">Salvo! Já está no site.</span>}
          <button disabled={salvar.isPending} className="botao-primario">{salvar.isPending ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
      </div>
    </form>
  )
}
