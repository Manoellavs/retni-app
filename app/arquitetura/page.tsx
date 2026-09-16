import { FederatedRemote } from '@/components/federated-remote'
import type { Transaction } from '@/lib/types'

const demonstrationTransactions: Transaction[] = [
  { id: 1, type: 'deposito', amount: 4850, description: 'Depósito de salário', category: 'salario', date: '2026-07-13' },
  { id: 2, type: 'pagamento', amount: 98.4, description: 'Conta de água', category: 'moradia', date: '2026-07-11' },
  { id: 3, type: 'pagamento', amount: 44.9, description: 'Netflix', category: 'lazer', date: '2026-07-09' },
]

export default function ArchitecturePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Demonstração técnica</p>
        <h1 className="text-balance text-3xl font-semibold">Composição por Module Federation</h1>
        <p className="text-pretty text-muted-foreground">Os dois módulos abaixo possuem builds independentes e são carregados em runtime pelo shell Next.js.</p>
      </header>
      <section aria-labelledby="dashboard-title">
        <h2 id="dashboard-title" className="sr-only">Dashboard remoto</h2>
        <FederatedRemote kind="dashboard" userName="Avaliador" initialTransactions={demonstrationTransactions} fallback={<p>Carregando dashboard remoto...</p>} />
      </section>
      <section aria-labelledby="transactions-title">
        <h2 id="transactions-title" className="sr-only">Transações remotas</h2>
        <FederatedRemote kind="transactions" initialTransactions={demonstrationTransactions} fallback={<p>Carregando transações remotas...</p>} />
      </section>
    </main>
  )
}
