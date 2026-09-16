import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTransactions } from '@/app/actions/transactions'
import { FinanceProvider } from '@/lib/finance-context'
import { StoreProvider } from '@/components/store-provider'
import { Header } from '@/components/header'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const transactions = await getTransactions()

  return (
    <StoreProvider transactions={transactions}>
      <FinanceProvider>
        <div className="flex min-h-screen flex-col">
          <Header userName={session.user.name} userEmail={session.user.email} />
          <main className="flex-1">{children}</main>
        </div>
      </FinanceProvider>
    </StoreProvider>
  )
}
