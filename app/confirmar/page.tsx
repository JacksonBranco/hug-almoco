'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Colaborador = { matricula: string; nome: string; departamento: string }

export default function ConfirmarPage() {
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [jaConfirmou, setJaConfirmou] = useState(false)
  const [foraDoPrazo, setForaDoPrazo] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const dados = sessionStorage.getItem('colaborador')
    if (!dados) { router.push('/'); return }
    const c: Colaborador = JSON.parse(dados)
    setColaborador(c)

    const agora = new Date()
    const hora = agora.getHours()
    if (hora < 5 || hora >= 9) setForaDoPrazo(true)

    fetch(`/api/confirmar?matricula=${c.matricula}`)
      .then((r) => r.json())
      .then((d) => setJaConfirmou(d.confirmado))
  }, [router])

  async function confirmar() {
    if (!colaborador) return
    setErro('')
    setCarregando(true)

    const res = await fetch('/api/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula: colaborador.matricula }),
    })

    const data = await res.json()
    setCarregando(false)

    if (!res.ok) {
      if (res.status === 409) setJaConfirmou(true)
      else setErro(data.erro)
      return
    }

    setMensagem(data.mensagem)
    setJaConfirmou(true)
  }

  function sair() {
    sessionStorage.removeItem('colaborador')
    router.push('/')
  }

  if (!colaborador) return null

  return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h1 className="text-xl font-bold text-gray-800">{colaborador.nome}</h1>
        <p className="text-gray-500 text-sm mb-6">Matrícula: {colaborador.matricula}</p>

        {jaConfirmou && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold">Almoço confirmado!</p>
            {mensagem && <p className="text-sm mt-1">{mensagem}</p>}
          </div>
        )}

        {foraDoPrazo && !jaConfirmou && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4">
            <div className="text-3xl mb-2">⏰</div>
            <p className="font-semibold">Fora do horário</p>
            <p className="text-sm mt-1">Confirmações aceitas somente entre 5h e 9h.</p>
          </div>
        )}

        {!jaConfirmou && !foraDoPrazo && (
          <>
            <p className="text-gray-600 mb-6">Você vai almoçar hoje?</p>
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                {erro}
              </div>
            )}
            <button
              onClick={confirmar}
              disabled={carregando}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
            >
              {carregando ? 'Confirmando...' : '✅ Sim, vou almoçar'}
            </button>
          </>
        )}

        <button
          onClick={sair}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
        >
          Sair
        </button>
      </div>
    </main>
  )
}
