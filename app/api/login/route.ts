import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { matricula } = await req.json()

  if (!matricula?.trim()) {
    return NextResponse.json({ erro: 'Matrícula obrigatória.' }, { status: 400 })
  }

  const db = getDb()
  const colaborador = db.prepare('SELECT * FROM colaboradores WHERE matricula = ?').get(matricula.trim())

  if (!colaborador) {
    return NextResponse.json({ erro: 'Matrícula não encontrada.' }, { status: 404 })
  }

  return NextResponse.json({ colaborador })
}
