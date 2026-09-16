import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ScreenHeader } from '@/components/screen-header'
import { TransactionForm } from '@/components/transaction-form'
import { useTransactions } from '@/context/transactions-context'
import { colors } from '@/theme'

export default function NewTransaction() {
  const { add } = useTransactions()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Nova transação" />
      <TransactionForm
        submitLabel="Salvar transação"
        onSubmit={async (input) => {
          await add(input)
          router.back()
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
})
