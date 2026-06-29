import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET — lista todos os colaboradores (protegido por senha RH)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }
  const db = getDb()
  const colaboradores = db.prepare('SELECT * FROM colaboradores ORDER BY nome').all()
  return NextResponse.json({ colaboradores })
}

// POST — importa colaboradores via JSON array [{ matricula, nome, departamento }]
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const { colaboradores } = await req.json()
  if (!Array.isArray(colaboradores)) {
    return NextResponse.json({ erro: 'Formato inválido.' }, { status: 400 })
  }

  const db = getDb()
  const upsert = db.prepare(
    'INSERT INTO colaboradores (matricula, nome, departamento) VALUES (?, ?, ?) ON CONFLICT(matricula) DO UPDATE SET nome=excluded.nome, departamento=excluded.departamento'
  )
  const insertMany = db.transaction((lista: { matricula: string; nome: string; departamento?: string }[]) => {
    for (const c of lista) upsert.run(c.matricula, c.nome, c.departamento ?? null)
  })
  insertMany(colaboradores)

  return NextResponse.json({ mensagem: `${colaboradores.length} colaborador(es) importado(s).` })
}

// DELETE — remove um colaborador
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('senha') !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }
  const matricula = searchParams.get('matricula')
  if (!matricula) return NextResponse.json({ erro: 'Matrícula obrigatória.' }, { status: 400 })

  const db = getDb()
  db.prepare('DELETE FROM colaboradores WHERE matricula = ?').run(matricula)
  return NextResponse.json({ mensagem: 'Colaborador removido.' })
}
