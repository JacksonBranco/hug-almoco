import { NextRequest, NextResponse } from 'next/server'
import { getPool, initSchema } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { matricula } = await req.json()

  if (!matricula?.trim()) {
    return NextResponse.json({ erro: 'Matrícula obrigatória.' }, { status: 400 })
  }

  await initSchema()
  const db = getPool()
  const result = await db.query('SELECT * FROM colaboradores WHERE matricula = $1', [matricula.trim()])

  if (result.rows.length === 0) {
    return NextResponse.json({ erro: 'Matrícula não encontrada.' }, { status: 404 })
  }

  return NextResponse.json({ colaborador: result.rows[0] })
}
