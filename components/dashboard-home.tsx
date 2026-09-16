'use client'

import {
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFinance } from '@/lib/finance-context'
import { formatCurrency } from '@/lib/transaction-utils'
import { NewTransactionDialog } from '@/components/new-transaction-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardHome({ userName }: { userName: string }) {
  const { account } = useFinance()
  const totalEntradas = account.transactions
    .filter((item) => item.type === 'deposito')
    .reduce((total, item) => total + item.amount, 0)
  const totalSaidas = account.transactions
    .filter((item) => item.type !== 'deposito')
    .reduce((total, item) => total + item.amount, 0)

  const monthlyData = Object.values(
    account.transactions.reduce<Record<string, { month: string; entradas: number; saidas: number }>>(
      (months, transaction) => {
        const month = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(
          new Date(`${transaction.date}T12:00:00Z`),
        )
        months[month] ??= { month, entradas: 0, saidas: 0 }
        if (transaction.type === 'deposito') months[month].entradas += transaction.amount
        else months[month].saidas += transaction.amount
        return months
      },
      {},
    ),
  ).slice(-6)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
      <header>
        <h1 className="text-balance text-2xl font-semibold text-foreground">
          Ola, {userName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Aqui esta o resumo da sua conta.</p>
      </header>

      <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Saldo atual</p>
            <p className={`text-2xl font-semibold ${account.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(account.balance)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-600" aria-hidden="true" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Entradas</p>
            </div>
            <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingDown className="h-3 w-3 text-destructive" aria-hidden="true" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Saidas</p>
            </div>
            <p className="text-2xl font-semibold text-destructive">{formatCurrency(totalSaidas)}</p>
          </CardContent>
        </Card>
      </section>

      <NewTransactionDialog
        trigger={(
          <Button size="lg" className="w-fit gap-2 bg-emerald-600 text-primary-foreground hover:bg-emerald-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova transacao
          </Button>
        )}
      />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Entradas e saidas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Registre transacoes para visualizar o grafico.</p>
          ) : (
            <div className="h-64 w-full" aria-label="Grafico de entradas e saidas por mes">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ left: 4, right: 4 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `R$ ${Number(value) / 1000}k`} tickLine={false} axisLine={false} width={55} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="entradas" name="Entradas" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" name="Saidas" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
