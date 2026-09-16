import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Transaction, TransactionInput } from '@/lib/types'

export interface TransactionsState {
  items: Transaction[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TransactionsState = { items: [], status: 'idle', error: null }

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>
  const body = await response.json().catch(() => ({ error: 'Falha na requisicao' }))
  throw new Error(body.error ?? 'Falha na requisicao')
}

export const fetchTransactions = createAsyncThunk('transactions/fetch', async () => {
  return parseResponse<Transaction[]>(await fetch('/api/transactions'))
})

export const addTransaction = createAsyncThunk('transactions/add', async (input: TransactionInput) => {
  return parseResponse<Transaction>(await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }))
})

export const editTransaction = createAsyncThunk(
  'transactions/edit',
  async ({ id, input }: { id: number; input: TransactionInput }) => parseResponse<Transaction>(
    await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  ),
)

export const removeTransaction = createAsyncThunk('transactions/remove', async (id: number) => {
  const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Nao foi possivel excluir a transacao')
  return id
})

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload
      state.status = 'succeeded'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchTransactions.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload })
      .addCase(fetchTransactions.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Erro ao carregar transacoes' })
      .addCase(addTransaction.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(addTransaction.fulfilled, (state, action) => { state.status = 'succeeded'; state.items.unshift(action.payload) })
      .addCase(addTransaction.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Erro ao salvar transacao' })
      .addCase(editTransaction.fulfilled, (state, action) => { const index = state.items.findIndex((item) => item.id === action.payload.id); if (index !== -1) state.items[index] = action.payload })
      .addCase(removeTransaction.fulfilled, (state, action) => { state.items = state.items.filter((item) => item.id !== action.payload) })
  },
})

export const { setTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer
