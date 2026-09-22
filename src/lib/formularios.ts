import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type FieldValues, type Path, type Resolver, type UseFormProps } from 'react-hook-form'
import { z } from 'zod'
import { ErroApi } from './api'

/**
 * Formulário com validação dupla:
 *  1. Zod no navegador (resposta instantânea, sem ir ao servidor);
 *  2. a API valida de novo e, se recusar, os erros dela aparecem no campo certo.
 * Nunca confie só na validação do front: qualquer um pode chamar a API direto.
 */
export function useFormulario<S extends z.ZodType<FieldValues, FieldValues>>(
  esquema: S,
  opcoes?: UseFormProps<z.input<S>, unknown, z.output<S>>,
) {
  type Entrada = z.input<S>
  // O cast só existe porque o TypeScript não consegue ligar o genérico S ao resolver; em tempo de execução é o mesmo objeto.
  const resolver = zodResolver(esquema as never) as unknown as Resolver<Entrada, unknown, z.output<S>>
  const form = useForm<Entrada, unknown, z.output<S>>({ resolver, mode: 'onTouched', ...opcoes })
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  const enviar = (acao: (dados: z.output<S>) => Promise<void>) =>
    form.handleSubmit(async (dados) => {
      setErroGeral(null)
      try {
        await acao(dados)
      } catch (e) {
        if (e instanceof ErroApi) {
          const porCampo = Object.entries(e.erros)
          porCampo.forEach(([campo, msg]) => form.setError(campo as Path<Entrada>, { message: msg }))
          if (porCampo.length === 0) setErroGeral(e.message)
        } else setErroGeral('Algo deu errado. Tente de novo.')
      }
    })

  return { ...form, enviar, erroGeral }
}

export const texto = (min: number, max: number, rotulo = 'Campo') =>
  z.string().trim().min(min, min <= 1 ? `${rotulo} é obrigatório.` : `Mínimo de ${min} caracteres.`).max(max, `Máximo de ${max} caracteres.`)

export const telefone = z.string().trim().refine((v) => {
  const d = v.replace(/\D/g, '').length
  return d >= 10 && d <= 13
}, 'Telefone com DDD, ex.: (81) 99999-9999')

export const emailOpcional = z.union([z.literal(''), z.email('E-mail inválido.')])
