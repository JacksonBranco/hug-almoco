import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const senha = searchParams.get('senha')
  const mes = searchParams.get('mes')

  if (senha !== process.env.RH_SENHA) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ erro: 'Mês inválido. Use o formato AAAA-MM.' }, { status: 400 })
  }

  const db = getPool()
  const result = await db.query(
    `SELECT c.matricula, col.nome, col.departamento, COUNT(*) as total_almocos
     FROM confirmacoes c
     JOIN colaboradores col ON col.matricula = c.matricula
     WHERE c.data LIKE $1
     GROUP BY c.matricula, col.nome, col.departamento
     ORDER BY col.nome`,
    [`${mes}%`]
  )

  const csv = [
    'Matrícula,Nome,Departamento,Total de Almoços',
    ...result.rows.map((r) => `${r.matricula},"${r.nome}","${r.departamento ?? ''}",${r.total_almocos}`),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-almoco-${mes}.csv"`,
    },
  })
}
