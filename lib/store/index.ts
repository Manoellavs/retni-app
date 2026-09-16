import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './transactions-slice'
import filtersReducer from './filters-slice'
import type { Transaction } from '@/lib/types'

export function makeStore(preloaded?: { transactions?: Transaction[] }) {
  return configureStore({
    reducer: {
      transactions: transactionsReducer,
      filters: filtersReducer,
    },
    preloadedState: preloaded?.transactions
      ? {
          transactions: {
            items: preloaded.transactions,
            status: 'succeeded' as const,
            error: null,
          },
        }
      : undefined,
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
