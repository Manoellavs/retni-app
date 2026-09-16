export type TransactionType = 'deposito' | 'transferencia' | 'pagamento' | 'saque'

export type TransactionCategory =
  | 'salario'
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'investimento'
  | 'outros'

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  date: string
  description: string
  category: TransactionCategory
  attachmentUrl?: string | null
  attachmentName?: string | null
}

export interface TransactionInput {
  type: TransactionType
  amount: number
  date: string
  description: string
  category: TransactionCategory
  attachmentUrl?: string | null
  attachmentName?: string | null
}

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'deposito', label: 'Deposito' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'saque', label: 'Saque' },
]

export const TRANSACTION_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'salario', label: 'Salario' },
  { value: 'alimentacao', label: 'Alimentacao' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'saude', label: 'Saude' },
  { value: 'educacao', label: 'Educacao' },
  { value: 'investimento', label: 'Investimento' },
  { value: 'outros', label: 'Outros' },
]

// Entradas somam ao saldo, saidas subtraem
export const CREDIT_TYPES: TransactionType[] = ['deposito']
