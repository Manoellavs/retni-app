import { NextResponse } from 'next/server'
import { createTransaction, getTransactions } from '@/app/actions/transactions'
import type { TransactionInput } from '@/lib/types'

export async function GET() {
  try {
    return NextResponse.json(await getTransactions())
  } catch {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as TransactionInput
    return NextResponse.json(await createTransaction(input), { status: 201 })
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : 'Nao foi possivel criar a transacao' },
      { status: 400 },
    )
  }
}
