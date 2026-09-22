/**
 * Redimensiona e converte a foto NO NAVEGADOR antes de enviar:
 *  - foto de 12 MB do celular vira ~400 KB em WebP;
 *  - gera também a miniatura usada no mosaico e no "blur-up".
 * Isso economiza o 4G de quem está subindo as fotos e deixa o site rápido.
 */
export interface FotoPreparada {
  grande: Blob
  miniatura: Blob
  largura: number
  altura: number
}

async function carregar(arquivo: File): Promise<ImageBitmap> {
  // imageOrientation corrige fotos "deitadas" (EXIF) tiradas com o celular em pé.
  return createImageBitmap(arquivo, { imageOrientation: 'from-image' })
}

function paraBlob(bitmap: ImageBitmap, maxLado: number, qualidade: number): Promise<{ blob: Blob; w: number; h: number }> {
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve({ blob: b, w, h }) : reject(new Error('Falha ao converter a imagem.'))), 'image/webp', qualidade),
  )
}

export async function prepararFoto(arquivo: File, maxLado = 2000): Promise<FotoPreparada> {
  const bitmap = await carregar(arquivo)
  try {
    const grande = await paraBlob(bitmap, maxLado, 0.84)
    const mini = await paraBlob(bitmap, 480, 0.7)
    return { grande: grande.blob, miniatura: mini.blob, largura: grande.w, altura: grande.h }
  } finally {
    bitmap.close()
  }
}

/** Para capas, pôster e fotos avulsas: uma versão só, otimizada. PNG com transparência continua PNG. */
export async function otimizarImagem(arquivo: File, maxLado = 2000): Promise<Blob> {
  if (arquivo.type === 'image/png') return arquivo // preserva a transparência do recorte do artista
  const bitmap = await carregar(arquivo)
  try { return (await paraBlob(bitmap, maxLado, 0.85)).blob } finally { bitmap.close() }
}

export const tamanhoLegivel = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
