import type { TransactionCategory } from '@/lib/types'

const rules: Array<{ terms: string[]; category: TransactionCategory }> = [
  { terms: ['salario', 'freelance', 'pagamento recebido'], category: 'salario' },
  { terms: ['mercado', 'restaurante', 'ifood', 'padaria', 'comida'], category: 'alimentacao' },
  { terms: ['aluguel', 'energia', 'agua', 'internet', 'condominio'], category: 'moradia' },
  { terms: ['uber', 'combustivel', 'onibus', 'metro', 'estacionamento'], category: 'transporte' },
  { terms: ['cinema', 'netflix', 'spotify', 'viagem', 'jogo'], category: 'lazer' },
  { terms: ['farmacia', 'medico', 'consulta', 'academia'], category: 'saude' },
  { terms: ['curso', 'faculdade', 'livro', 'escola'], category: 'educacao' },
  { terms: ['investimento', 'tesouro', 'acao', 'cdb'], category: 'investimento' },
]

export function suggestCategory(description: string): TransactionCategory {
  const normalized = description.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return rules.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.category ?? 'outros'
}
