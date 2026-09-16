import { NextResponse } from 'next/server'
import { deleteTransaction, updateTransaction } from '@/app/actions/transactions'
import type { TransactionInput } from '@/lib/types'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const input = await request.json() as TransactionInput
    return NextResponse.json(await updateTransaction(Number(id), input))
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : 'Nao foi possivel atualizar a transacao' },
      { status: 400 },
    )
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    await deleteTransaction(Number(id))
    return new NextResponse(null, { status: 204 })
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : 'Nao foi possivel excluir a transacao' },
      { status: 400 },
    )
  }
}
