import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { matricula } = await req.json()

  if (!matricula?.trim()) {
    return NextResponse.json({ erro: 'Matrícula obrigatória.' }, { status: 400 })
  }

  // Horário de Brasília
  const agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const hora = agora.getHours()

  if (hora < 5 || hora >= 9) {
    return NextResponse.json(
      { erro: 'Confirmações aceitas somente entre 5h e 9h.' },
      { status: 403 }
    )
  }

  const hoje = agora.toISOString().slice(0, 10)
  const db = getDb()

  const jaConfirmou = db
    .prepare('SELECT id FROM confirmacoes WHERE matricula = ? AND data = ?')
    .get(matricula.trim(), hoje)

  if (jaConfirmou) {
    return NextResponse.json({ erro: 'Você já confirmou seu almoço hoje.' }, { status: 409 })
  }

  db.prepare(
    'INSERT INTO confirmacoes (matricula, data, confirmado_em) VALUES (?, ?, ?)'
  ).run(matricula.trim(), hoje, new Date().toISOString())

  return NextResponse.json({ mensagem: 'Almoço confirmado com sucesso!' })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const matricula = searchParams.get('matricula')
  const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    .toISOString()
    .slice(0, 10)

  const db = getDb()
  const confirmacao = db
    .prepare('SELECT id FROM confirmacoes WHERE matricula = ? AND data = ?')
    .get(matricula, hoje)

  return NextResponse.json({ confirmado: !!confirmacao })
}
