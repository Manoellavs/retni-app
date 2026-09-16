'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { publishTransactionEvent, transactionEvents, type Transaction, type TransactionCategory, type TransactionInput, type TransactionType } from '@retni/contracts'
import { Badge, Button, Card, transactionIcons } from '@retni/ui'
import '@retni/ui/theme.css'

export interface TransactionsProps { apiBaseUrl?: string; initialTransactions?: Transaction[] }
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const labels: Record<TransactionType, string> = { deposito: 'Depósito', transferencia: 'Transferência', pagamento: 'Pagamento', saque: 'Saque' }
const categories: Record<TransactionCategory, string> = { salario: 'Salário', alimentacao: 'Alimentação', moradia: 'Moradia', transporte: 'Transporte', lazer: 'Lazer', saude: 'Saúde', educacao: 'Educação', investimento: 'Investimento', outros: 'Outros' }
const emptyInput: TransactionInput = { type: 'pagamento', amount: 0, description: '', category: 'outros', date: new Date().toISOString().slice(0, 10) }

function suggestCategory(description: string): TransactionCategory {
  const value = description.toLocaleLowerCase('pt-BR')
  if (/salário|salario|pagamento recebido/.test(value)) return 'salario'
  if (/mercado|restaurante|lanche|padaria/.test(value)) return 'alimentacao'
  if (/aluguel|água|agua|luz|condomínio|condominio/.test(value)) return 'moradia'
  if (/uber|ônibus|onibus|combustível|combustivel/.test(value)) return 'transporte'
  if (/farmácia|farmacia|consulta|médico|medico/.test(value)) return 'saude'
  if (/curso|faculdade|livro|escola/.test(value)) return 'educacao'
  if (/cinema|netflix|spotify|jogo/.test(value)) return 'lazer'
  return 'outros'
}

export default function Transactions({ apiBaseUrl = '', initialTransactions = [] }: TransactionsProps) {
  const [items, setItems] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TransactionType | 'all'>('all')
  const [category, setCategory] = useState<TransactionCategory | 'all'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<TransactionInput>(emptyInput)
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => items.filter((item) =>
    (type === 'all' || item.type === type) &&
    (category === 'all' || item.category === category) &&
    (!startDate || item.date >= startDate) &&
    (!endDate || item.date <= endDate) &&
    item.description.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
  ), [category, endDate, items, search, startDate, type])
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * 8, current * 8)

  const openForm = (transaction?: Transaction) => {
    setEditing(transaction ?? null)
    setForm(transaction ? { type: transaction.type, amount: transaction.amount, description: transaction.description, category: transaction.category, date: transaction.date, attachmentName: transaction.attachmentName, attachmentUrl: transaction.attachmentUrl } : emptyInput)
    document.querySelector<HTMLDialogElement>('#transaction-remote-dialog')?.showModal()
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('Salvando...')
    const endpoint = editing ? `${apiBaseUrl}/api/transactions/${editing.id}` : `${apiBaseUrl}/api/transactions`
    const response = await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) })
    if (!response.ok) { setMessage('Não foi possível salvar a transação.'); return }
    const saved = await response.json() as Transaction
    setItems((currentItems) => editing ? currentItems.map((item) => item.id === saved.id ? saved : item) : [saved, ...currentItems])
    publishTransactionEvent(editing ? transactionEvents.updated : transactionEvents.created, saved)
    document.querySelector<HTMLDialogElement>('#transaction-remote-dialog')?.close(); setMessage('')
  }

  const remove = async (transaction: Transaction) => {
    if (!window.confirm(`Excluir ${transaction.description}?`)) return
    const response = await fetch(`${apiBaseUrl}/api/transactions/${transaction.id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) return
    setItems((currentItems) => currentItems.filter((item) => item.id !== transaction.id))
    publishTransactionEvent(transactionEvents.deleted, transaction)
  }

  const selectAttachment = (file?: File) => {
    if (!file) return setForm({ ...form, attachmentName: null, attachmentUrl: null })
    if (file.size > 2 * 1024 * 1024) return setMessage('O comprovante deve ter no máximo 2 MB.')
    const reader = new FileReader()
    reader.onload = () => setForm({ ...form, attachmentName: file.name, attachmentUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  return <main style={{ display: 'grid', gap: 20 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap' }}><div><p style={{ margin: 0, color: 'var(--retni-muted)' }}>Microfrontend de transações</p><h1 style={{ margin: '4px 0 0' }}>Extrato</h1></div><Button onClick={() => openForm()}><Plus size={16}/> Nova transação</Button></header>
    <Card aria-label="Filtros de transações"><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><label style={{ flex: 1, minWidth: 220 }}>Busca<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar por descrição" style={inputStyle}/></label><label>Tipo<select value={type} onChange={(e) => { setType(e.target.value as TransactionType | 'all'); setPage(1) }} style={inputStyle}><option value="all">Todos</option>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Categoria<select value={category} onChange={(e) => { setCategory(e.target.value as TransactionCategory | 'all'); setPage(1) }} style={inputStyle}><option value="all">Todas</option>{Object.entries(categories).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>De<input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} style={inputStyle}/></label><label>Até<input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} style={inputStyle}/></label></div></Card>
    <div style={{ display: 'grid', gap: 8 }}>{visible.map((item) => { const Icon = transactionIcons[item.type]; return <Card key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}><Icon size={18}/><div><strong>{item.description}</strong><div style={{ display: 'flex', gap: 8, marginTop: 4 }}><Badge>{labels[item.type]}</Badge><small>{categories[item.category]}</small><small>{new Date(`${item.date}T12:00:00Z`).toLocaleDateString('pt-BR')}</small>{item.attachmentUrl && <a href={item.attachmentUrl} download={item.attachmentName ?? 'comprovante'}>Comprovante</a>}</div></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><strong>{item.type === 'deposito' ? '+' : '-'}{money.format(item.amount)}</strong><Button variant="outline" aria-label={`Editar ${item.description}`} onClick={() => openForm(item)}><Pencil size={15}/></Button><Button variant="outline" aria-label={`Excluir ${item.description}`} onClick={() => void remove(item)}><Trash2 size={15}/></Button></div></Card> })}</div>
    {!visible.length && <Card><Search size={20}/><p>Nenhuma movimentação encontrada.</p></Card>}
    <nav aria-label="Paginação" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><small>{filtered.length} registros</small><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Button variant="outline" disabled={current === 1} onClick={() => setPage(current - 1)}>Anterior</Button><span>{current} de {pages}</span><Button variant="outline" disabled={current === pages} onClick={() => setPage(current + 1)}>Próxima</Button></div></nav>
    <dialog id="transaction-remote-dialog" className="retni-dialog"><form onSubmit={save} style={{ padding: 20, display: 'grid', gap: 14 }}><h2>{editing ? 'Editar' : 'Nova'} transação</h2><label>Descrição<input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value, category: suggestCategory(e.target.value) })} style={inputStyle}/><small>A categoria é sugerida conforme a descrição e pode ser alterada.</small></label><label>Valor<input required min="0.01" step="0.01" type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} style={inputStyle}/></label><label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })} style={inputStyle}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Categoria<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })} style={inputStyle}>{Object.entries(categories).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Data<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle}/></label><label>Comprovante (opcional)<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => selectAttachment(event.target.files?.[0])} style={inputStyle}/><small>PNG, JPG, WEBP ou PDF, até 2 MB.</small></label>{form.attachmentName && <small>Arquivo: {form.attachmentName}</small>}{message && <p role="status">{message}</p>}<div style={{ display: 'flex', justifyContent: 'end', gap: 8 }}><Button type="button" variant="outline" onClick={() => document.querySelector<HTMLDialogElement>('#transaction-remote-dialog')?.close()}>Cancelar</Button><Button type="submit">Salvar</Button></div></form></dialog>
  </main>
}
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', marginTop: 6, padding: 10, border: '1px solid var(--retni-border)', borderRadius: 8, background: 'var(--retni-card)', color: 'var(--retni-text)' }
