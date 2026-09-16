import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import {
  createTransaction,
  deleteTransaction as deleteRemote,
  subscribeToTransactions,
  updateTransaction,
} from '@/services/transactions'
import { removeAttachment } from '@/services/storage'
import { signedAmount, type Transaction, type TransactionInput } from '@/domain/transaction'

interface TransactionsContextValue {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  balance: number
  totalIn: number
  totalOut: number
  add: (input: TransactionInput) => Promise<void>
  edit: (id: string, input: TransactionInput) => Promise<void>
  remove: (transaction: Transaction) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToTransactions(
      user.uid,
      (items) => {
        setTransactions(items)
        setError(null)
        setLoading(false)
      },
      (message) => {
        setError(message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user])

  const value = useMemo<TransactionsContextValue>(() => {
    const totals = transactions.reduce(
      (accumulator, transaction) => {
        const signed = signedAmount(transaction)
        if (signed >= 0) accumulator.totalIn += signed
        else accumulator.totalOut += Math.abs(signed)
        accumulator.balance += signed
        return accumulator
      },
      { balance: 0, totalIn: 0, totalOut: 0 },
    )

    return {
      transactions,
      loading,
      error,
      balance: totals.balance,
      totalIn: totals.totalIn,
      totalOut: totals.totalOut,
      async add(input) {
        if (!user) throw new Error('Sessão expirada.')
        await createTransaction(user.uid, input)
      },
      async edit(id, input) {
        await updateTransaction(id, input)
      },
      async remove(transaction) {
        if (transaction.attachmentPath) await removeAttachment(transaction.attachmentPath)
        await deleteRemote(transaction.id)
      },
    }
  }, [transactions, loading, error, user])

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) throw new Error('useTransactions deve ser usado dentro de TransactionsProvider')
  return context
}
