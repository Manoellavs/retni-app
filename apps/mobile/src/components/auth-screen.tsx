import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Field } from '@/components/ui'
import { useAuth } from '@/context/auth-context'
import { colors, spacing, typography } from '@/theme'

type Mode = 'sign-in' | 'sign-up'

export function AuthScreen({ mode }: { mode: Mode }) {
  const { signIn, signUp } = useAuth()
  const isSignUp = mode === 'sign-up'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(null)
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.')
      return
    }
    if (isSignUp && !name.trim()) {
      setError('Informe seu nome.')
      return
    }
    setLoading(true)
    try {
      if (isSignUp) await signUp(name, email, password)
      else await signIn(email, password)
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>RETNI</Text>
            <Text style={styles.subtitle}>Controle Financeiro</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>{isSignUp ? 'Criar conta' : 'Entrar'}</Text>
            <Text style={styles.helper}>
              {isSignUp
                ? 'Crie sua conta para começar a organizar suas finanças.'
                : 'Acesse sua conta para continuar.'}
            </Text>

            {isSignUp ? (
              <Field
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Como quer ser chamado"
                autoCapitalize="words"
              />
            ) : null}

            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Field
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              label={isSignUp ? 'Criar conta' : 'Entrar'}
              onPress={submit}
              loading={loading}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Já tem conta?' : 'Ainda não tem conta?'}
              </Text>
              <Link href={isSignUp ? '/(auth)/sign-in' : '/(auth)/sign-up'} style={styles.link}>
                {isSignUp ? 'Entrar' : 'Criar conta'}
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  header: { alignItems: 'center', gap: spacing.xs },
  brand: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: typography.subheading,
    color: colors.textMuted,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  helper: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: -spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: typography.body,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  switchText: { color: colors.textMuted, fontSize: typography.body },
  link: { color: colors.brand, fontWeight: '700', fontSize: typography.body },
})
