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
  id: string
  userId: string
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date: string
  attachmentUrl: string | null
  attachmentName: string | null
  attachmentPath: string | null
  createdAt: number
}

export type TransactionInput = Omit<Transaction, 'id' | 'userId' | 'createdAt'>

export const transactionTypeLabels: Record<TransactionType, string> = {
  deposito: 'Depósito',
  transferencia: 'Transferência',
  pagamento: 'Pagamento',
  saque: 'Saque',
}

export const categoryLabels: Record<TransactionCategory, string> = {
  salario: 'Salário',
  alimentacao: 'Alimentação',
  moradia: 'Moradia',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  educacao: 'Educação',
  investimento: 'Investimento',
  outros: 'Outros',
}

// Entradas somam ao saldo; saídas subtraem.
export const inflowTypes: TransactionType[] = ['deposito']

export function isInflow(type: TransactionType) {
  return inflowTypes.includes(type)
}

export function signedAmount(transaction: Pick<Transaction, 'type' | 'amount'>) {
  return isInflow(transaction.type) ? transaction.amount : -transaction.amount
}

export function suggestCategory(description: string): TransactionCategory {
  const value = description.toLocaleLowerCase('pt-BR')
  if (/sal[áa]rio|pagamento recebido|renda/.test(value)) return 'salario'
  if (/mercado|restaurante|lanche|padaria|ifood|comida/.test(value)) return 'alimentacao'
  if (/aluguel|[áa]gua|luz|condom[íi]nio|internet|energia/.test(value)) return 'moradia'
  if (/uber|[ôo]nibus|combust[íi]vel|gasolina|transporte|metr[ôo]/.test(value)) return 'transporte'
  if (/farm[áa]cia|consulta|m[ée]dico|sa[úu]de|dentista/.test(value)) return 'saude'
  if (/curso|faculdade|livro|escola|educa[çc][ãa]o/.test(value)) return 'educacao'
  if (/cinema|netflix|spotify|jogo|viagem|lazer/.test(value)) return 'lazer'
  if (/investimento|a[çc][ãa]o|tesouro|cdb|fundo/.test(value)) return 'investimento'
  return 'outros'
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR')
}
