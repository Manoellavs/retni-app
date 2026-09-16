'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '@/lib/store'
import type { Transaction } from '@/lib/types'

export function StoreProvider({
  children,
  transactions,
}: {
  children: React.ReactNode
  transactions?: Transaction[]
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = makeStore({ transactions })
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
