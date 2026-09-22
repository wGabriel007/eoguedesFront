import { useState } from 'react'
import { z } from 'zod'
import { CabecalhoPagina, Cartao } from '../../componentes/admin/Kit'
import { Campo } from '../../componentes/ui/Basicos'
import { useSessao } from '../../contextos/Sessao'
import { enviarJson } from '../../lib/api'
import { useFormulario } from '../../lib/formularios'

const esquema = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual.'),
  novaSenha: z.string().min(10, 'Use pelo menos 10 caracteres.'),
  confirmacao: z.string(),
}).refine((d) => d.novaSenha === d.confirmacao, { path: ['confirmacao'], message: 'As senhas não conferem.' })

export function PaginaConta() {
  const { sessao, sair } = useSessao()
  const f = useFormulario(esquema)
  const [ok, setOk] = useState(false)
  const e = f.formState.errors

  return (
    <>
      <CabecalhoPagina titulo="Minha conta" descricao={`${sessao?.nome} · ${sessao?.email}`} />
      <Cartao className="max-w-md">
        <h2 className="mb-4 text-2xl">Trocar senha</h2>
        {ok ? <p className="font-semibold text-secundaria">Senha alterada! Use a nova no próximo acesso.</p> : (
          <form className="space-y-4" noValidate
                onSubmit={f.enviar(async (d) => { await enviarJson('/api/admin/senha', { senhaAtual: d.senhaAtual, novaSenha: d.novaSenha }); setOk(true) })}>
            <Campo rotulo="Senha atual" type="password" autoComplete="current-password" {...f.register('senhaAtual')} erro={e.senhaAtual?.message} />
            <Campo rotulo="Nova senha" type="password" autoComplete="new-password" {...f.register('novaSenha')} erro={e.novaSenha?.message} />
            <Campo rotulo="Repita a nova senha" type="password" autoComplete="new-password" {...f.register('confirmacao')} erro={e.confirmacao?.message} />
            {f.erroGeral && <p className="text-sm text-red-400">{f.erroGeral}</p>}
            <button disabled={f.formState.isSubmitting} className="botao-primario w-full">Salvar nova senha</button>
          </form>
        )}
      </Cartao>
      <button onClick={sair} className="mt-6 text-sm underline">Sair do painel</button>
    </>
  )
}
