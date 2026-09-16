'use client'

import { useEffect, useMemo, useState } from 'react'
import { TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { subscribeToTransactionEvents, type Transaction } from '@retni/contracts'
import { Card, theme } from '@retni/ui'
import '@retni/ui/theme.css'

export interface DashboardProps { apiBaseUrl?: string; initialTransactions?: Transaction[]; userName?: string }
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard({ apiBaseUrl = '', initialTransactions = [], userName = 'Visitante' }: DashboardProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>('ready')

  useEffect(() => {
    const refresh = async () => {
      setStatus('loading')
      try {
        const response = await fetch(`${apiBaseUrl}/api/transactions`, { credentials: 'include' })
        if (!response.ok) throw new Error('Falha ao carregar')
        setTransactions(await response.json() as Transaction[])
        setStatus('ready')
      } catch { setStatus(initialTransactions.length ? 'ready' : 'error') }
    }
    return subscribeToTransactionEvents(() => void refresh())
  }, [apiBaseUrl, initialTransactions.length])

  const metrics = useMemo(() => {
    const income = transactions.filter((item) => item.type === 'deposito').reduce((sum, item) => sum + item.amount, 0)
    const expenses = transactions.filter((item) => item.type !== 'deposito').reduce((sum, item) => sum + item.amount, 0)
    return { income, expenses, balance: income - expenses }
  }, [transactions])

  const chart = useMemo(() => Object.values(transactions.reduce<Record<string, { month: string; entradas: number; saidas: number }>>((months, item) => {
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(`${item.date}T12:00:00Z`))
    months[month] ??= { month, entradas: 0, saidas: 0 }
    if (item.type === 'deposito') months[month].entradas += item.amount
    else months[month].saidas += item.amount
    return months
  }, {})).slice(-6), [transactions])

  if (status === 'error') return <Card role="alert"><strong>Dashboard indisponível.</strong><p>O microfrontend pode ser executado isoladamente, mas precisa de uma API autenticada para exibir dados.</p></Card>

  return <main aria-busy={status === 'loading'} style={{ display: 'grid', gap: 24 }}>
    <header><p style={{ margin: 0, color: theme.muted }}>Visão analítica federada</p><h1 style={{ margin: '4px 0 0' }}>Olá, {userName.split(' ')[0]}</h1></header>
    <div className="retni-grid" data-columns="3" aria-label="Indicadores financeiros">
      <MetricCard label="Saldo atual" value={metrics.balance} icon={<WalletCards size={18} />} />
      <MetricCard label="Entradas" value={metrics.income} icon={<TrendingUp size={18} />} color={theme.brand} />
      <MetricCard label="Saídas" value={metrics.expenses} icon={<TrendingDown size={18} />} color={theme.danger} />
    </div>
    <Card><h2 style={{ marginTop: 0, fontSize: 16 }}>Entradas e saídas por mês</h2>
      <div style={{ width: '100%', height: 280 }} aria-label="Gráfico de entradas e saídas">
        <ResponsiveContainer><BarChart data={chart}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis width={55}/><Tooltip formatter={(value) => money.format(Number(value))}/><Bar dataKey="entradas" fill={theme.brand} radius={[4,4,0,0]}/><Bar dataKey="saidas" fill={theme.danger} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
      </div>
    </Card>
  </main>
}

function MetricCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
  return <Card><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: color ?? theme.muted }}>{icon}<span>{label}</span></div><strong style={{ display: 'block', marginTop: 8, fontSize: 26, color }}>{money.format(value)}</strong></Card>
}
