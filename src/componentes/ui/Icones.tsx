import type { SVGProps } from 'react'

// Ícones em SVG embutido: nenhum pacote extra, nenhuma requisição a mais.
type P = SVGProps<SVGSVGElement>
const base = (props: P) => ({ width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true, ...props })

export const IconeInstagram = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
)
export const IconeYouTube = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.7 15.1V8.9L15.5 12l-5.8 3.1Z" /></svg>
)
export const IconeSpotify = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm5 15.9a.7.7 0 0 1-1 .2c-2.7-1.6-6-2-10-1.1a.7.7 0 1 1-.3-1.3c4.3-1 8-.6 11 1.2.3.2.4.7.3 1Zm1.3-2.9a.9.9 0 0 1-1.2.3c-3-1.9-7.7-2.4-11.3-1.3a.9.9 0 1 1-.5-1.7c4.1-1.2 9.2-.6 12.7 1.5.4.3.5.8.3 1.2Zm.1-3c-3.7-2.2-9.7-2.4-13.2-1.3a1 1 0 1 1-.6-2c4-1.2 10.7-1 14.9 1.5a1 1 0 0 1-1 1.8Z" /></svg>
)
export const IconeTikTok = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" /></svg>
)
export const IconeFacebook = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.6c-4 0-4.9 3-4.9 4.9v2H6.8v4H9.1V22.4h4.9V12.5h3.3l.4-4Z" /></svg>
)
export const IconeWhatsApp = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" /></svg>
)
export const IconePlay = (p: P) => <svg {...base(p)} fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z" /></svg>
export const IconePausa = (p: P) => <svg {...base(p)} fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
export const IconeProxima = (p: P) => <svg {...base(p)} fill="currentColor"><path d="M5 5.5v13a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v5L6.6 4.7A1 1 0 0 0 5 5.5Z" /></svg>
export const IconeAnterior = (p: P) => <svg {...base(p)} fill="currentColor" style={{ transform: 'scaleX(-1)' }}><path d="M5 5.5v13a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v5L6.6 4.7A1 1 0 0 0 5 5.5Z" /></svg>
export const IconeFechar = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
export const IconeMenu = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
export const IconeSeta = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
export const IconeCalendario = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
export const IconeMapa = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>
export const IconeIngresso = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M13 6v12" strokeDasharray="2 2" /></svg>
export const IconeDownload = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
export const IconeMais = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
export const IconeLixeira = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
export const IconeLapis = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>
export const IconeCheck = (p: P) => <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
export const IconeEstrela = (p: P) => <svg {...base(p)} fill="currentColor"><path d="m12 2 3 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8 5.5 21.7l1.7-7.3L1.6 9.5 9 8.9Z" /></svg>
export const IconeNota = (p: P) => <svg {...base(p)} fill="currentColor"><path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>

export const REDES = [
  { chave: 'instagram', nome: 'Instagram', Icone: IconeInstagram },
  { chave: 'tikTok', nome: 'TikTok', Icone: IconeTikTok },
  { chave: 'youTube', nome: 'YouTube', Icone: IconeYouTube },
  { chave: 'spotify', nome: 'Spotify', Icone: IconeSpotify },
  { chave: 'facebook', nome: 'Facebook', Icone: IconeFacebook },
] as const
