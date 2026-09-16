import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '@/context/auth-context'
import { TransactionsProvider } from '@/context/transactions-context'
import { isFirebaseConfigured } from '@/config/firebase'
import { colors, spacing, typography } from '@/theme'

function AuthGuard() {
  const { user, initializing } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (initializing) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (user && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [user, initializing, segments, router])

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Configuração pendente</Text>
        <Text style={styles.message}>
          Preencha o arquivo .env com as credenciais do Firebase (use o .env.example como
          referência) e reinicie o aplicativo.
        </Text>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <AuthProvider>
          <TransactionsProvider>
            <StatusBar style="dark" />
            <AuthGuard />
          </TransactionsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
})
