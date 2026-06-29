'use client'

import { useState } from 'react'

export default function RhPage() {
  const [senha, setSenha] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [erro, setErro] = useState('')
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7))
  const [importJson, setImportJson] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [colaboradores, setColaboradores] = useState<{ matricula: string; nome: string; departamento: string }[]>([])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/colaboradores?senha=${senha}`)
    if (!res.ok) { setErro('Senha incorreta.'); return }
    const data = await res.json()
    setColaboradores(data.colaboradores)
    setAutenticado(true)
    setErro('')
  }

  async function importar() {
    setMensagem('')
    try {
      const lista = JSON.parse(importJson)
      const res = await fetch(`/api/colaboradores?senha=${senha}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaboradores: lista }),
      })
      const data = await res.json()
      setMensagem(data.mensagem ?? data.erro)
      if (res.ok) {
        const atualizado = await fetch(`/api/colaboradores?senha=${senha}`)
        setColaboradores((await atualizado.json()).colaboradores)
        setImportJson('')
      }
    } catch {
      setMensagem('JSON inválido. Verifique o formato.')
    }
  }

  async function remover(matricula: string) {
    if (!confirm(`Remover matrícula ${matricula}?`)) return
    await fetch(`/api/colaboradores?senha=${senha}&matricula=${matricula}`, { method: 'DELETE' })
    setColaboradores((prev) => prev.filter((c) => c.matricula !== matricula))
  }

  function exportarRelatorio() {
    window.open(`/api/relatorio?senha=${senha}&mes=${mes}`, '_blank')
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">Painel RH</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha do RH"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoFocus
            />
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Entrar
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            <a href="/" className="hover:underline">Voltar ao app</a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Painel RH</h1>
          <button onClick={() => setAutenticado(false)} className="text-sm text-gray-500 hover:underline">Sair</button>
        </div>

        {/* Relatório */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Exportar Relatório Mensal</h2>
          <div className="flex gap-3">
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={exportarRelatorio}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Baixar CSV
            </button>
          </div>
        </div>

        {/* Importar colaboradores */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-2">Importar Colaboradores (JSON)</h2>
          <p className="text-xs text-gray-400 mb-3">
            Formato: <code>[{'{'}&#34;matricula&#34;:&#34;001&#34;,&#34;nome&#34;:&#34;João&#34;,&#34;departamento&#34;:&#34;TI&#34;{'}'}]</code>
          </p>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            placeholder='[{"matricula":"001","nome":"João Silva","departamento":"TI"}]'
          />
          <button
            onClick={importar}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Importar
          </button>
          {mensagem && <p className="mt-2 text-sm text-gray-600">{mensagem}</p>}
        </div>

        {/* Lista de colaboradores */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Colaboradores ({colaboradores.length})</h2>
          {colaboradores.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum colaborador cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Matrícula</th>
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Departamento</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((c) => (
                  <tr key={c.matricula} className="border-b last:border-0">
                    <td className="py-2 text-gray-600">{c.matricula}</td>
                    <td className="py-2 font-medium text-gray-800">{c.nome}</td>
                    <td className="py-2 text-gray-600">{c.departamento}</td>
                    <td className="py-2">
                      <button
                        onClick={() => remover(c.matricula)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
