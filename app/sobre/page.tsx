import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Card } from '@/packages/ui/src'

export const metadata: Metadata = {
  title: 'Sobre o RETNI',
  description: 'Conheça a arquitetura e os recursos do gerenciador financeiro RETNI.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Badge>Conteúdo estático — SSG</Badge>
        <h1 className="text-balance text-4xl font-semibold">Um jeito simples de acompanhar suas finanças.</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          O RETNI ajuda a registrar entradas e saídas, consultar o extrato e acompanhar o saldo sem complicação.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Arquitetura do RETNI">
        <Card><h2 className="font-semibold">Shell Next.js</h2><p className="text-sm text-muted-foreground">Autenticação, SSR, APIs e composição.</p></Card>
        <Card><h2 className="font-semibold">Dashboard remoto</h2><p className="text-sm text-muted-foreground">Saldo, KPIs e gráficos financeiros.</p></Card>
        <Card><h2 className="font-semibold">Transações remotas</h2><p className="text-sm text-muted-foreground">Busca, filtros, paginação e CRUD.</p></Card>
      </section>
      <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/sign-in">Acessar minha conta</Link>
    </main>
  )
}
