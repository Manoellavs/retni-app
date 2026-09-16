import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'

interface AuthContextValue {
  user: User | null
  initializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Converte os codigos de erro do Firebase em mensagens em portugues.
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.'
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em instantes.'
    default:
      return 'Não foi possível concluir. Tente novamente.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      initializing,
      async signIn(email, password) {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password)
        } catch (error) {
          throw new Error(friendlyError((error as { code?: string }).code ?? ''))
        }
      },
      async signUp(name, email, password) {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
          if (name.trim()) {
            await updateProfile(credential.user, { displayName: name.trim() })
            setUser({ ...credential.user })
          }
        } catch (error) {
          throw new Error(friendlyError((error as { code?: string }).code ?? ''))
        }
      },
      async logout() {
        await signOut(auth)
      },
    }
  }, [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
