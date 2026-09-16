import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Transaction, TransactionInput } from '@/domain/transaction'

const COLLECTION = 'transactions'

// Escuta em tempo real apenas as transacoes do usuario logado.
export function subscribeToTransactions(
  userId: string,
  onData: (items: Transaction[]) => void,
  onError: (message: string) => void,
) {
  const transactionsQuery = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  )

  return onSnapshot(
    transactionsQuery,
    (snapshot) => {
      const items = snapshot.docs.map((entry) => {
        const data = entry.data()
        return {
          id: entry.id,
          userId: data.userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          description: data.description ?? '',
          category: data.category ?? 'outros',
          date: data.date,
          attachmentUrl: data.attachmentUrl ?? null,
          attachmentName: data.attachmentName ?? null,
          attachmentPath: data.attachmentPath ?? null,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as Transaction
      })
      onData(items)
    },
    (error) => onError(error.message),
  )
}

export async function createTransaction(userId: string, input: TransactionInput) {
  await addDoc(collection(db, COLLECTION), {
    ...input,
    userId,
    createdAt: serverTimestamp(),
  })
}

export async function updateTransaction(id: string, input: TransactionInput) {
  await updateDoc(doc(db, COLLECTION, id), { ...input })
}

export async function deleteTransaction(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}
