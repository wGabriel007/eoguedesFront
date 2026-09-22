export const TEMAS = [
  { id: 'paredao', nome: 'Paredão', descricao: 'Preto de festa, magenta neon e verde-limão: luz de paredão e moto tunada.' },
  { id: 'recife-noturno', nome: 'Recife Noturno', descricao: 'Azul-noite, laranja de pôr do sol e ciano: a cidade depois das 22h.' },
  { id: 'lambe-lambe', nome: 'Lambe-lambe', descricao: 'Papel de cartaz, vermelho e amarelo: os anúncios de show colados no muro.' },
] as const

export const FONTES = [
  { id: 'impacto', nome: 'Impacto', descricao: 'Anton + Inter' },
  { id: 'letreiro', nome: 'Letreiro', descricao: 'Bebas Neue + Manrope' },
] as const

export type TemaId = (typeof TEMAS)[number]['id']
export type FonteId = (typeof FONTES)[number]['id']

export function aplicarTema(tema: TemaId, fonte: FonteId) {
  document.documentElement.dataset.tema = tema
  document.documentElement.dataset.fonte = fonte
}
