import { createRoot } from 'react-dom/client'
import type { TransactionsRemoteProps } from '@retni/contracts'
import Transactions from './Transactions'

export function mount(element: HTMLElement, props: TransactionsRemoteProps) {
  const root = createRoot(element)
  root.render(<Transactions {...props} />)
  return () => root.unmount()
}
