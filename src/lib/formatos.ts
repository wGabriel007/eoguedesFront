// Datas sempre exibidas no horário de Recife, não importa onde o fã esteja.
const FUSO = 'America/Recife'

export function partesData(iso: string) {
  const d = new Date(iso)
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, ...o }).format(d)
  return {
    dia: fmt({ day: '2-digit' }),
    mes: fmt({ month: 'short' }).replace('.', '').toUpperCase(),
    ano: fmt({ year: 'numeric' }),
    semana: fmt({ weekday: 'long' }),
    hora: fmt({ hour: '2-digit', minute: '2-digit' }),
  }
}

export const dataCurta = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))

/** "2026-11-05" (DateOnly) → "05/11/2026" sem passar por fuso horário. */
export const dataSemFuso = (d: string) => d.split('-').reverse().join('/')

export const anoDe = (d: string) => d.slice(0, 4)

export function duracao(segundos: number | null) {
  if (!segundos) return ''
  const m = Math.floor(segundos / 60)
  const s = String(Math.floor(segundos % 60)).padStart(2, '0')
  return `${m}:${s}`
}

export const tempoRelativo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  if (diff < 3600) return rtf.format(-Math.max(1, Math.round(diff / 60)), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  return rtf.format(-Math.round(diff / 86400), 'day')
}

/** Converte "2026-11-20T22:00" (input datetime-local, horário de Recife) para ISO com fuso -03:00. */
export const localParaIso = (local: string) => `${local}:00-03:00`

/** Converte ISO (UTC) para o valor de um input datetime-local no horário de Recife. */
export function isoParaLocal(iso: string) {
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000)
  return d.toISOString().slice(0, 16)
}

export const linkWhatsApp = (numero: string, mensagem: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
