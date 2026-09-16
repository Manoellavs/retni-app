import { useMemo, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTransactions } from '@/context/transactions-context'
import {
  categoryLabels,
  formatCurrency,
  formatDate,
  isInflow,
  signedAmount,
  transactionTypeLabels,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from '@/domain/transaction'
import { colors, radius, spacing, typography } from '@/theme'

type TypeFilter = TransactionType | 'all'
type CategoryFilter = TransactionCategory | 'all'

export default function TransactionsList() {
  const { transactions, loading } = useTransactions()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase('pt-BR')
    return transactions.filter((transaction) => {
      const matchType = typeFilter === 'all' || transaction.type === typeFilter
      const matchCategory = categoryFilter === 'all' || transaction.category === categoryFilter
      const matchTerm = transaction.description.toLocaleLowerCase('pt-BR').includes(term)
      return matchType && matchCategory && matchTerm
    })
  }, [transactions, search, typeFilter, categoryFilter])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(app)/transactions/new')}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por descrição"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
        <FilterChips
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { key: 'all', label: 'Todos os tipos' },
            ...Object.entries(transactionTypeLabels).map(([key, label]) => ({
              key: key as TransactionType,
              label,
            })),
          ]}
        />
        <FilterChips
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { key: 'all', label: 'Todas as categorias' },
            ...Object.entries(categoryLabels).map(([key, label]) => ({
              key: key as TransactionCategory,
              label,
            })),
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onPress={() => router.push(`/(app)/transactions/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Carregando transações...' : 'Nenhuma transação encontrada.'}
          </Text>
        }
      />
    </SafeAreaView>
  )
}

function FilterChips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { key: T; label: string }[]
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={options}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.chipRow}
      renderItem={({ item }) => {
        const active = item.key === value
        return (
          <Pressable
            onPress={() => onChange(item.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )
      }}
    />
  )
}

function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction
  onPress: () => void
}) {
  const inflow = isInflow(transaction.type)
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowInfo}>
        <Text style={styles.rowDescription} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.rowMeta}>
          {transactionTypeLabels[transaction.type]} • {categoryLabels[transaction.category]}
        </Text>
        <Text style={styles.rowDate}>{formatDate(transaction.date)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowAmount, inflow ? styles.inflow : styles.outflow]}>
          {formatCurrency(signedAmount(transaction))}
        </Text>
        {transaction.attachmentUrl ? <Text style={styles.receipt}>Comprovante</Text> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  addButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: typography.body },
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  chipRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  chipText: { fontSize: typography.caption, color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.brandDark },
  list: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowDescription: { fontSize: typography.subheading, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: typography.caption, color: colors.textMuted },
  rowDate: { fontSize: typography.caption, color: colors.textMuted },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  rowAmount: { fontSize: typography.subheading, fontWeight: '700' },
  inflow: { color: colors.brand },
  outflow: { color: colors.danger },
  receipt: { fontSize: typography.caption, color: colors.textMuted },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.xxl,
  },
})
