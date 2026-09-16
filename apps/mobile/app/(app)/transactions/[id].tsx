import { useMemo } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScreenHeader } from '@/components/screen-header'
import { TransactionForm } from '@/components/transaction-form'
import { Button } from '@/components/ui'
import { useTransactions } from '@/context/transactions-context'
import { colors, spacing, typography } from '@/theme'

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { transactions, edit, remove } = useTransactions()
  const router = useRouter()

  const transaction = useMemo(
    () => transactions.find((item) => item.id === id),
    [transactions, id],
  )

  const confirmDelete = () => {
    if (!transaction) return
    Alert.alert('Excluir transação', `Deseja excluir "${transaction.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await remove(transaction)
          router.back()
        },
      },
    ])
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Transação" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Transação não encontrada.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Editar transação" />
      <TransactionForm
        initial={transaction}
        submitLabel="Salvar alterações"
        onSubmit={async (input) => {
          await edit(transaction.id, input)
          router.back()
        }}
      />
      <View style={styles.deleteArea}>
        <Button label="Excluir transação" variant="danger" onPress={confirmDelete} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { fontSize: typography.body, color: colors.textMuted },
  deleteArea: { padding: spacing.lg, paddingTop: 0 },
})
