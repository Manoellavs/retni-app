'use client'

import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { init, loadRemote } from '@module-federation/enhanced/runtime'
import type { Transaction } from '@/lib/types'

interface RemoteProps {
  apiBaseUrl?: string
  initialTransactions?: Transaction[]
  userName?: string
}

interface RemoteMountModule {
  mount: (element: HTMLElement, props: RemoteProps) => () => void
}

interface FederatedRemoteProps extends RemoteProps {
  kind: 'dashboard' | 'transactions'
  fallback: ReactNode
}

let initialized = false

function remoteEntry(value: string | undefined, fallback: string) {
  const url = value ?? fallback
  return url.endsWith('.js') || url.endsWith('.json') ? url : `${url.replace(/\/$/, '')}/remoteEntry.js`
}

function initializeFederation() {
  if (initialized) return
  init({
    name: 'retni_shell',
    remotes: [
      {
        name: 'retni_dashboard',
        type: 'module',
        entry: remoteEntry(process.env.NEXT_PUBLIC_DASHBOARD_REMOTE_URL, 'http://localhost:4171'),
        entryGlobalName: 'retni_dashboard',
      },
      {
        name: 'retni_transactions',
        type: 'module',
        entry: remoteEntry(process.env.NEXT_PUBLIC_TRANSACTIONS_REMOTE_URL, 'http://localhost:4172'),
        entryGlobalName: 'retni_transactions',
      },
    ],
  })
  initialized = true
}

export function FederatedRemote({ kind, fallback, ...props }: FederatedRemoteProps) {
  const [mount, setMount] = useState<RemoteMountModule['mount'] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    initializeFederation()
    const request = kind === 'dashboard' ? 'retni_dashboard/Mount' : 'retni_transactions/Mount'
    loadRemote<RemoteMountModule>(request)
      .then((module) => {
        if (active && module?.mount) setMount(() => module.mount)
        else if (active) setFailed(true)
      })
      .catch(() => active && setFailed(true))
    return () => { active = false }
  }, [kind])

  if (mount) return <RemoteMount mount={mount} props={props} />
  return <div data-federation-state={failed ? 'fallback' : 'loading'}>{fallback}</div>
}

function RemoteMount({ mount, props }: { mount: RemoteMountModule['mount']; props: RemoteProps }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!element) return
    return mount(element, props)
  }, [element, mount, props])

  return <div ref={setElement} data-federation-state="remote" />
}
