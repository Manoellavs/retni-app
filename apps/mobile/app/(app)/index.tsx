import { useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BarChart, PieChart } from 'react-native-gifted-charts'
import { useRouter } from 'expo-router'
import { Button, Card } from '@/components/ui'
import { useAuth } from '@/context/auth-context'
import { useTransactions } from '@/context/transactions-context'
import {
  categoryLabels,
  formatCurrency,
  signedAmount,
  type TransactionCategory,
} from '@/domain/transaction'
import { colors, radius, spacing, typography } from '@/theme'

const periods = [
  { key: '30', label: '30 dias' },
  { key: '90', label: '90 dias' },
  { key: 'all', label: 'Tudo' },
] as const

type PeriodKey = (typeof periods)[number]['key']

const categoryPalette: string[] = [
  '#16845b',
  '#0f5f42',
  '#4c9f70',
  '#c53c3c',
  '#e0a458',
  '#3d6cb9',
  '#8e5bb5',
  '#5aa9a3',
  '#9aa0a6',
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { transactions, loading } = useTransactions()
  const router = useRouter()
  const [period, setPeriod] = useState<PeriodKey>('30')

  const filtered = useMemo(() => {
    if (period === 'all') return transactions
    const limit = new Date()
    limit.setDate(limit.getDate() - Number(period))
    const iso = limit.toISOString().slice(0, 10)
    return transactions.filter((transaction) => transaction.date >= iso)
  }, [transactions, period])

  const summary = useMemo(() => {
    return filtered.reduce(
      (accumulator, transaction) => {
        const signed = signedAmount(transaction)
        if (signed >= 0) accumulator.income += signed
        else accumulator.expense += Math.abs(signed)
        accumulator.balance += signed
        return accumulator
      },
      { balance: 0, income: 0, expense: 0 },
    )
  }, [filtered])

  const pieData = useMemo(() => {
    const totals = new Map<TransactionCategory, number>()
    filtered.forEach((transaction) => {
      const signed = signedAmount(transaction)
      if (signed < 0) {
        totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + Math.abs(signed))
      }
    })
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, value], index) => ({
        value,
        color: categoryPalette[index % categoryPalette.length],
        label: categoryLabels[category],
      }))
  }, [filtered])

  const barData = useMemo(() => {
    return [
      { value: summary.income, label: 'Entradas', frontColor: colors.brand },
      { value: summary.expense, label: 'Saídas', frontColor: colors.danger },
    ]
  }, [summary])

  const firstName = user?.displayName?.split(' ')[0] ?? 'por aqui'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {}} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName}</Text>
            <Text style={styles.subtitle}>Resumo das suas finanças</Text>
          </View>
          <Button label="Sair" variant="outline" onPress={logout} />
        </View>

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo do período</Text>
          <Text
            style={[
              styles.balanceValue,
              summary.balance < 0 ? styles.negative : styles.positive,
            ]}
          >
            {formatCurrency(summary.balance)}
          </Text>
          <View style={styles.periodRow}>
            {periods.map((item) => {
              const active = item.key === period
              return (
                <Text
                  key={item.key}
                  onPress={() => setPeriod(item.key)}
                  style={[styles.periodChip, active && styles.periodChipActive]}
                >
                  {item.label}
                </Text>
              )
            })}
          </View>
        </Card>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(summary.income)}
            </Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Saídas</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(summary.expense)}
            </Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Entradas x Saídas</Text>
          {summary.income === 0 && summary.expense === 0 ? (
            <Text style={styles.empty}>Sem dados no período selecionado.</Text>
          ) : (
            <BarChart
              data={barData}
              barWidth={48}
              spacing={48}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              isAnimated
              height={160}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Saídas por categoria</Text>
          {pieData.length === 0 ? (
            <Text style={styles.empty}>Nenhuma saída registrada no período.</Text>
          ) : (
            <View style={styles.pieRow}>
              <PieChart data={pieData} donut radius={80} innerRadius={48} isAnimated />
              <View style={styles.legend}>
                {pieData.map((slice) => (
                  <View key={slice.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                    <Text style={styles.legendLabel}>{slice.label}</Text>
                    <Text style={styles.legendValue}>{formatCurrency(slice.value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Button label="Nova transação" onPress={() => router.push('/(app)/transactions/new')} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: typography.body, color: colors.textMuted },
  balanceCard: { gap: spacing.sm },
  balanceLabel: { fontSize: typography.body, color: colors.textMuted },
  balanceValue: { fontSize: 34, fontWeight: '800' },
  positive: { color: colors.brand },
  negative: { color: colors.danger },
  periodRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    overflow: 'hidden',
  },
  periodChipActive: { backgroundColor: colors.brandSoft, color: colors.brandDark },
  summaryRow: { flexDirection: 'row', gap: spacing.lg },
  summaryCard: { flex: 1, gap: spacing.xs },
  summaryLabel: { fontSize: typography.body, color: colors.textMuted },
  summaryValue: { fontSize: typography.heading, fontWeight: '700' },
  cardTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted, fontSize: typography.body },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  legend: { flex: 1, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: typography.caption, color: colors.text },
  legendValue: { fontSize: typography.caption, color: colors.textMuted, fontWeight: '600' },
})
