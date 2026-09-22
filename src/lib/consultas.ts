import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import type { Artista, CategoriaFoto, Foto, Lancamento, Marco, Recado, Show, Video } from './tipos'

// Hooks do TanStack Query: cache, loading e erro prontos.
// A chave (queryKey) identifica o dado; o painel "invalida" a chave depois de editar.

export const useArtista = () =>
  useQuery({ queryKey: ['artista'], queryFn: () => api<Artista>('/api/artista'), staleTime: 5 * 60_000 })

export const useShows = (periodo: 'proximos' | 'anteriores' = 'proximos', habilitado = true) =>
  useQuery({ queryKey: ['shows', periodo], queryFn: () => api<Show[]>(`/api/shows?periodo=${periodo}`), enabled: habilitado })

export const useLancamentos = () =>
  useQuery({ queryKey: ['lancamentos'], queryFn: () => api<Lancamento[]>('/api/lancamentos') })

export const useVideos = () =>
  useQuery({ queryKey: ['videos'], queryFn: () => api<Video[]>('/api/videos') })

export const useFotos = (categoria?: CategoriaFoto) =>
  useQuery({
    queryKey: ['fotos', categoria ?? 'todas'],
    queryFn: () => api<Foto[]>(`/api/fotos${categoria ? `?categoria=${categoria}` : ''}`),
  })

export const useTrajetoria = () =>
  useQuery({ queryKey: ['trajetoria'], queryFn: () => api<Marco[]>('/api/trajetoria') })

export const useRecados = () =>
  useQuery({ queryKey: ['recados'], queryFn: () => api<Recado[]>('/api/recados') })
