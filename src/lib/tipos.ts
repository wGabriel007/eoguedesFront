// Espelho dos DTOs da API (.NET). Se mudar lá, muda aqui.

export type StatusShow = 'Agendado' | 'Realizado' | 'Cancelado'
export type TipoLancamento = 'Album' | 'EP' | 'Single'
export type TipoVideo = 'YouTube' | 'Upload'
export type CategoriaFoto = 'Show' | 'Bastidores' | 'Ensaio' | 'Bairro'
export type TipoMensagem = 'Contato' | 'Imprensa'
export type PlataformaStreaming = 'Spotify' | 'AppleMusic' | 'Deezer' | 'YouTubeMusic' | 'AmazonMusic' | 'SoundCloud' | 'Outro'

export interface Redes {
  instagram: string | null
  tikTok: string | null
  youTube: string | null
  spotify: string | null
  facebook: string | null
}

export interface Artista {
  nomeArtistico: string
  bioCurta: string
  bioCompleta: string
  fraseDeImpacto: string | null
  bairro: string
  cidade: string
  whatsApp: string | null
  emailContato: string | null
  urlVideoHero: string | null
  urlPosterHero: string | null
  urlRecorteArtista: string | null
  urlRiderTecnico: string | null
  redes: Redes
  tema: string
  fonte: string
}

export interface Show {
  id: string
  dataHora: string
  nomeEvento: string
  local: string
  endereco: string | null
  cidade: string
  linkComoChegar: string | null
  linkIngresso: string | null
  status: StatusShow
  linkGoogleAgenda: string
}

export interface Faixa {
  numero: number
  titulo: string
  duracaoSegundos: number | null
  urlPrevia: string | null
}

export interface LinkStreaming {
  plataforma: PlataformaStreaming
  url: string
}

export interface Lancamento {
  id: string
  titulo: string
  tipo: TipoLancamento
  dataLancamento: string
  urlCapa: string
  faixas: Faixa[]
  links: LinkStreaming[]
}

export interface Video {
  id: string
  titulo: string
  tipo: TipoVideo
  youTubeId: string | null
  url: string | null
  urlCapa: string | null
  dataLancamento: string | null
  destaque: boolean
  ordem: number
}

export interface Foto {
  id: string
  url: string
  urlMiniatura: string
  legenda: string | null
  categoria: CategoriaFoto
  largura: number
  altura: number
  destaque: boolean
  ordem: number
}

export interface Marco {
  id: string
  ano: number
  titulo: string
  descricao: string
  urlFoto: string | null
  ordem: number
}

export interface Recado {
  id: string
  nome: string
  bairroCidade: string | null
  mensagem: string
  criadoEm: string
  aprovado: boolean
}

// ---- Painel ----
export interface Mensagem {
  id: string
  nome: string
  email: string
  telefone: string | null
  tipo: TipoMensagem
  mensagem: string
  lida: boolean
  criadoEm: string
}

export interface PedidoContratacao {
  id: string
  nome: string
  telefone: string
  email: string | null
  tipoEvento: string
  dataEvento: string
  cidade: string
  quantidadeConvidados: number | null
  observacoes: string | null
  respondido: boolean
  criadoEm: string
  linkWhatsAppCliente: string
}

export interface ResumoPainel {
  recadosPendentes: number
  mensagensNaoLidas: number
  pedidosAbertos: number
  proximosShows: number
  fotos: number
  clipes: number
  lancamentos: number
  proximoShow: Show | null
}

export interface Sessao {
  token: string
  expiraEmUtc: string
  nome: string
  email: string
  papel: string
}

export interface ResultadoUpload {
  url: string
  tipo: string
  bytes: number
  largura: number | null
  altura: number | null
}

export const NOMES_PLATAFORMA: Record<PlataformaStreaming, string> = {
  Spotify: 'Spotify',
  AppleMusic: 'Apple Music',
  Deezer: 'Deezer',
  YouTubeMusic: 'YouTube Music',
  AmazonMusic: 'Amazon Music',
  SoundCloud: 'SoundCloud',
  Outro: 'Ouvir',
}

export const CATEGORIAS_FOTO: CategoriaFoto[] = ['Show', 'Ensaio', 'Bastidores', 'Bairro']
