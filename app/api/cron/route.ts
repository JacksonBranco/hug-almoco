import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    .toISOString()
    .slice(0, 10)

  const db = getDb()
  const total = (
    db.prepare('SELECT COUNT(*) as total FROM confirmacoes WHERE data = ?').get(hoje) as { total: number }
  ).total

  const dataFormatada = new Date(hoje + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_RESTAURANTE!,
    subject: `Almoços HUG — ${dataFormatada}`,
    html: `
      <h2>Confirmação de Almoços — HUG</h2>
      <p>Data: <strong>${dataFormatada}</strong></p>
      <p>Total de almoços confirmados: <strong>${total}</strong></p>
      <hr/>
      <p style="color:#666;font-size:12px">Mensagem automática enviada pelo sistema de almoços HUG.</p>
    `,
  })

  return NextResponse.json({ mensagem: `E-mail enviado. Total: ${total}` })
}
