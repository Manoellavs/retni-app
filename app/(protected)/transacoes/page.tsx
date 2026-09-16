import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { TransactionList } from '@/components/transaction-list'
import { FederatedRemote } from '@/components/federated-remote'
import { getTransactions } from '@/app/actions/transactions'

export const dynamic = 'force-dynamic'

export default async function TransacoesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const transactions = await getTransactions()

  const fallback = (
    <>
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Extrato completo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Consulte, filtre e gerencie suas movimentações.</p>
      </header>
      <TransactionList />
    </>
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <FederatedRemote kind="transactions" initialTransactions={transactions} fallback={fallback} />
    </div>
  )
}
