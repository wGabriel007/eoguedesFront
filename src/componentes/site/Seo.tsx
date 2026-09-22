import { useEffect } from 'react'
import type { Artista, Lancamento, Show } from '../../lib/tipos'

/**
 * Dados estruturados (JSON-LD) para o Google entender o site:
 *  - MusicGroup: quem é o artista, redes sociais, músicas;
 *  - MusicEvent: cada show vira um evento que pode aparecer na busca.
 */
export function Seo({ artista, shows, lancamentos }: { artista: Artista; shows?: Show[]; lancamentos?: Lancamento[] }) {
  useEffect(() => {
    const url = window.location.origin
    document.title = `${artista.nomeArtistico}: site oficial | Brega funk de ${artista.bairro}`
    definirMeta('description', artista.bioCurta)
    definirMeta('og:title', `${artista.nomeArtistico}: site oficial`, 'property')
    definirMeta('og:description', artista.bioCurta, 'property')

    const redes = Object.values(artista.redes).filter(Boolean)
    const grupo = {
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      name: artista.nomeArtistico,
      url,
      genre: 'Brega funk',
      description: artista.bioCurta,
      image: artista.urlPosterHero ? new URL(artista.urlPosterHero, url).href : undefined,
      foundingLocation: { '@type': 'Place', name: `${artista.bairro}, ${artista.cidade}` },
      sameAs: redes,
      album: lancamentos?.map((l) => ({
        '@type': 'MusicAlbum', name: l.titulo, datePublished: l.dataLancamento, image: new URL(l.urlCapa, url).href,
        numTracks: l.faixas.length,
      })),
    }
    const eventos = (shows ?? []).map((s) => ({
      '@context': 'https://schema.org',
      '@type': 'MusicEvent',
      name: `${artista.nomeArtistico}: ${s.nomeEvento}`,
      startDate: s.dataHora,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: s.local, address: [s.endereco, s.cidade].filter(Boolean).join(', ') },
      performer: { '@type': 'MusicGroup', name: artista.nomeArtistico },
      offers: s.linkIngresso ? { '@type': 'Offer', url: s.linkIngresso } : undefined,
    }))

    let script = document.getElementById('json-ld') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'json-ld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify([grupo, ...eventos])
  }, [artista, shows, lancamentos])
  return null
}

function definirMeta(nome: string, conteudo: string, atributo: 'name' | 'property' = 'name') {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${nome}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(atributo, nome)
    document.head.appendChild(tag)
  }
  tag.content = conteudo
}
