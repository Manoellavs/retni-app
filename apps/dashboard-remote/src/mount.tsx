import { createRoot } from 'react-dom/client'
import type { DashboardRemoteProps } from '@retni/contracts'
import Dashboard from './Dashboard'

export function mount(element: HTMLElement, props: DashboardRemoteProps) {
  const root = createRoot(element)
  root.render(<Dashboard {...props} />)
  return () => root.unmount()
}
