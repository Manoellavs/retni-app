'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Transaction, TransactionInput } from '@/lib/types'
import { calculateBalance } from '@/lib/transaction-utils'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  addTransaction as addTransactionThunk,
  editTransaction as editTransactionThunk,
  removeTransaction,
} from '@/lib/store/transactions-slice'

type Account = {
  balance: number
  transactions: Transaction[]
}

type FinanceContextValue = {
  account: Account
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  addTransaction: (transaction: TransactionInput) => Promise<void>
  editTransaction: (id: number, transaction: TransactionInput) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.transactions)

  const value = useMemo<FinanceContextValue>(() => ({
    account: {
      transactions: items,
      balance: calculateBalance(items),
    },
    status,
    error,
    addTransaction: async (input) => {
      await dispatch(addTransactionThunk(input)).unwrap()
    },
    editTransaction: async (id, input) => {
      await dispatch(editTransactionThunk({ id, input })).unwrap()
    },
    deleteTransaction: async (id) => {
      await dispatch(removeTransaction(id)).unwrap()
    },
  }), [dispatch, error, items, status])

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinance deve ser usado dentro de FinanceProvider')
  return context
}
