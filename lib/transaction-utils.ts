import type { Transaction, TransactionType } from '@/lib/types'
import { CREDIT_TYPES } from '@/lib/types'

export const transactionTypeLabels: Record<TransactionType, string> = {
  deposito: 'Deposito',
  transferencia: 'Transferencia',
  pagamento: 'Pagamento',
  saque: 'Saque',
}

export const transactionTypeColors: Record<TransactionType, { bg: string; text: string }> = {
  deposito: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  transferencia: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pagamento: { bg: 'bg-amber-100', text: 'text-amber-700' },
  saque: { bg: 'bg-rose-100', text: 'text-rose-700' },
}

export function isCredit(type: TransactionType): boolean {
  return CREDIT_TYPES.includes(type)
}

export function signedAmount(t: Pick<Transaction, 'type' | 'amount'>): number {
  return isCredit(t.type) ? t.amount : -t.amount
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + signedAmount(t), 0)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString + 'T00:00:00'))
}
