import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const senha = searchParams.get('senha')
  const mes = searchParams.get('mes') // formato: 2025-06

  if (senha !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ erro: 'Mês inválido. Use o formato AAAA-MM.' }, { status: 400 })
  }

  const db = getDb()
  const rows = db
    .prepare(
      `SELECT c.matricula, col.nome, col.departamento, COUNT(*) as total_almocos
       FROM confirmacoes c
       JOIN colaboradores col ON col.matricula = c.matricula
       WHERE c.data LIKE ?
       GROUP BY c.matricula
       ORDER BY col.nome`
    )
    .all(`${mes}%`) as { matricula: string; nome: string; departamento: string; total_almocos: number }[]

  const csv = [
    'Matrícula,Nome,Departamento,Total de Almoços',
    ...rows.map((r) => `${r.matricula},"${r.nome}","${r.departamento ?? ''}",${r.total_almocos}`),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-almoco-${mes}.csv"`,
    },
  })
}
