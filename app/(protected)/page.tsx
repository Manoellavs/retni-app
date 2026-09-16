import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardHome } from '@/components/dashboard-home'
import { FederatedRemote } from '@/components/federated-remote'
import { getTransactions } from '@/app/actions/transactions'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const transactions = await getTransactions()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <FederatedRemote
        kind="dashboard"
        userName={session.user.name}
        initialTransactions={transactions}
        fallback={<DashboardHome userName={session.user.name} />}
      />
    </div>
  )
}
