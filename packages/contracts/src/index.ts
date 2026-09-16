export type TransactionType = 'deposito' | 'transferencia' | 'pagamento' | 'saque'
export type TransactionCategory = 'alimentacao' | 'moradia' | 'transporte' | 'saude' | 'educacao' | 'lazer' | 'salario' | 'investimento' | 'outros'

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date: string
  attachmentName?: string | null
  attachmentUrl?: string | null
}

export interface TransactionInput extends Omit<Transaction, 'id'> {}

export interface DashboardRemoteProps {
  apiBaseUrl?: string
  initialTransactions?: Transaction[]
  userName?: string
}

export interface TransactionsRemoteProps {
  apiBaseUrl?: string
  initialTransactions?: Transaction[]
}

export const transactionEvents = {
  created: 'transaction-created',
  updated: 'transaction-updated',
  deleted: 'transaction-deleted',
  refreshDashboard: 'dashboard:refresh',
} as const

export type TransactionEventName = typeof transactionEvents[keyof typeof transactionEvents]

export function publishTransactionEvent(name: TransactionEventName, transaction?: Transaction) {
  window.dispatchEvent(new CustomEvent(name, { detail: transaction }))
  if (name !== transactionEvents.refreshDashboard) {
    window.dispatchEvent(new CustomEvent(transactionEvents.refreshDashboard))
  }
}

export function subscribeToTransactionEvents(listener: EventListener) {
  Object.values(transactionEvents).forEach((eventName) => window.addEventListener(eventName, listener))
  return () => Object.values(transactionEvents).forEach((eventName) => window.removeEventListener(eventName, listener))
}
