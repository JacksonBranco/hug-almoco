import { NextRequest, NextResponse } from 'next/server'
import { getPool, initSchema } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }
  await initSchema()
  const db = getPool()
  const result = await db.query('SELECT * FROM colaboradores ORDER BY nome')
  return NextResponse.json({ colaboradores: result.rows })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const { colaboradores } = await req.json()
  if (!Array.isArray(colaboradores)) {
    return NextResponse.json({ erro: 'Formato inválido.' }, { status: 400 })
  }

  await initSchema()
  const db = getPool()
  for (const c of colaboradores) {
    await db.query(
      `INSERT INTO colaboradores (matricula, nome, departamento) VALUES ($1, $2, $3)
       ON CONFLICT(matricula) DO UPDATE SET nome=EXCLUDED.nome, departamento=EXCLUDED.departamento`,
      [c.matricula, c.nome, c.departamento ?? null]
    )
  }

  return NextResponse.json({ mensagem: `${colaboradores.length} colaborador(es) importado(s).` })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }
  const matricula = searchParams.get('matricula')
  if (!matricula) return NextResponse.json({ erro: 'Matrícula obrigatória.' }, { status: 400 })

  const db = getPool()
  await db.query('DELETE FROM colaboradores WHERE matricula = $1', [matricula])
  return NextResponse.json({ mensagem: 'Colaborador removido.' })
}
