'use server'

import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/session'
import type { Transaction, TransactionInput } from '@/lib/types'

function serialize(row: typeof transactions.$inferSelect): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10),
    description: row.description ?? '',
    category: (row.category ?? 'outros') as Transaction['category'],
    attachmentUrl: row.attachmentUrl,
    attachmentName: row.attachmentName,
  }
}

const starterTransactions = [
  { type: 'deposito', amount: '4850.00', description: 'Depósito de salário', category: 'salario', dateOffset: 0 },
  { type: 'pagamento', amount: '98.40', description: 'Conta de água', category: 'moradia', dateOffset: 2 },
  { type: 'pagamento', amount: '21.90', description: 'Spotify', category: 'lazer', dateOffset: 4 },
  { type: 'pagamento', amount: '44.90', description: 'Netflix', category: 'lazer', dateOffset: 6 },
  { type: 'pagamento', amount: '249.90', description: 'Curso Alura', category: 'educacao', dateOffset: 8 },
  { type: 'transferencia', amount: '180.00', description: 'PIX para Maria Josefa', category: 'outros', dateOffset: 10 },
  { type: 'pagamento', amount: '120.00', description: 'Ingresso do jogo', category: 'lazer', dateOffset: 12 },
] as const

function dateBeforeToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export async function getTransactions(): Promise<Transaction[]> {
  const userId = await getUserId()
  let rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.id))

  const missingTransactions = starterTransactions.filter((starter) =>
    !rows.some((row) => row.type === starter.type && Number(row.amount) === Number(starter.amount))
  )

  if (missingTransactions.length > 0) {
    const insertedRows = await db
      .insert(transactions)
      .values(missingTransactions.map(({ dateOffset, ...transaction }) => ({
        ...transaction,
        userId,
        date: dateBeforeToday(dateOffset),
      })))
      .returning()

    rows = [...rows, ...insertedRows]
  }

  return rows
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .map(serialize)
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const userId = await getUserId()

  if (!input.amount || input.amount <= 0) {
    throw new Error('O valor deve ser maior que zero')
  }
  if (!input.date) {
    throw new Error('A data e obrigatoria')
  }

  const [row] = await db
    .insert(transactions)
    .values({
      userId,
      type: input.type,
      amount: input.amount.toFixed(2),
      description: input.description,
      category: input.category,
      attachmentUrl: input.attachmentUrl ?? null,
      attachmentName: input.attachmentName ?? null,
      date: input.date,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/transacoes')
  return serialize(row)
}

export async function updateTransaction(
  id: number,
  input: TransactionInput,
): Promise<Transaction> {
  const userId = await getUserId()

  if (!input.amount || input.amount <= 0) {
    throw new Error('O valor deve ser maior que zero')
  }

  const [row] = await db
    .update(transactions)
    .set({
      type: input.type,
      amount: input.amount.toFixed(2),
      description: input.description,
      category: input.category,
      attachmentUrl: input.attachmentUrl ?? null,
      attachmentName: input.attachmentName ?? null,
      date: input.date,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()

  if (!row) throw new Error('Transacao nao encontrada')

  revalidatePath('/')
  revalidatePath('/transacoes')
  return serialize(row)
}

export async function deleteTransaction(id: number): Promise<void> {
  const userId = await getUserId()
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
  revalidatePath('/transacoes')
}
