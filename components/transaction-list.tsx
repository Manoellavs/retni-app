'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, CreditCard, FileText, Pencil, Plus, Receipt, Search, Trash2 } from 'lucide-react'
import { useFinance } from '@/lib/finance-context'
import { formatCurrency, formatDate, transactionTypeColors, transactionTypeLabels } from '@/lib/transaction-utils'
import { TRANSACTION_CATEGORIES, type Transaction, type TransactionCategory, type TransactionType } from '@/lib/types'
import { EditTransactionDialog } from '@/components/edit-transaction-dialog'
import { NewTransactionDialog } from '@/components/new-transaction-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const PAGE_SIZE = 8
const transactionIcons: Record<TransactionType, typeof ArrowDownLeft> = {
  deposito: ArrowDownLeft,
  transferencia: ArrowUpRight,
  pagamento: Receipt,
  saque: CreditCard,
}

export function TransactionList() {
  const { account, deleteTransaction, status } = useFinance()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [viewing, setViewing] = useState<Transaction | null>(null)
  const [type, setType] = useState<TransactionType | 'all'>('all')
  const [category, setCategory] = useState<TransactionCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => account.transactions.filter((transaction) => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
    return (type === 'all' || transaction.type === type)
      && (category === 'all' || transaction.category === category)
      && (!normalizedSearch || transaction.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
      && (!startDate || transaction.date >= startDate)
      && (!endDate || transaction.date <= endDate)
  }), [account.transactions, category, endDate, search, startDate, type])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleTransactions = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const resetPage = () => setPage(1)

  const clearFilters = () => {
    setType('all'); setCategory('all'); setSearch(''); setStartDate(''); setEndDate(''); setPage(1)
  }

  const handleDelete = async () => {
    if (!deleting) return
    await deleteTransaction(deleting.id)
    setDeleting(null)
  }

  return (
    <>
      <section aria-label="Filtros de transacoes" className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Buscar por descricao" placeholder="Buscar por descricao..." value={search} onChange={(event) => { setSearch(event.target.value); resetPage() }} className="pl-9" />
          </div>
          <NewTransactionDialog trigger={<Button className="gap-2 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"><Plus className="h-4 w-4" aria-hidden="true" />Nova transacao</Button>} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={type} onValueChange={(value) => { setType(value as TransactionType | 'all'); resetPage() }}>
            <SelectTrigger aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{(Object.keys(transactionTypeLabels) as TransactionType[]).map((key) => <SelectItem key={key} value={key}>{transactionTypeLabels[key]}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={category} onValueChange={(value) => { setCategory(value as TransactionCategory | 'all'); resetPage() }}>
            <SelectTrigger aria-label="Filtrar por categoria"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{TRANSACTION_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" aria-label="Data inicial" value={startDate} onChange={(event) => { setStartDate(event.target.value); resetPage() }} />
          <Input type="date" aria-label="Data final" min={startDate} value={endDate} onChange={(event) => { setEndDate(event.target.value); resetPage() }} />
          <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
        </div>
      </section>

      {status === 'loading' ? (
        <p role="status" className="py-12 text-center text-muted-foreground">Carregando transacoes...</p>
      ) : visibleTransactions.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nenhuma movimentacao encontrada.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleTransactions.map((transaction) => {
            const Icon = transactionIcons[transaction.type]
            const colors = transactionTypeColors[transaction.type]
            const isDeposit = transaction.type === 'deposito'
            return (
              <article key={transaction.id} className="group flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className={`shrink-0 rounded-md p-2 ${colors.bg}`}><Icon className={`h-4 w-4 ${colors.text}`} aria-hidden="true" /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">{transactionTypeLabels[transaction.type]}</Badge>
                      <span className="text-xs text-muted-foreground">{TRANSACTION_CATEGORIES.find((item) => item.value === transaction.category)?.label}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className={`text-right font-medium ${isDeposit ? 'text-emerald-600' : 'text-destructive'}`}>{isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}</p>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(transaction)} aria-label={`Ver detalhes de ${transaction.description}`}><Search className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(transaction)} aria-label={`Editar ${transaction.description}`}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(transaction)} aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <nav aria-label="Paginacao das transacoes" className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={safePage === 1} onClick={() => setPage((current) => current - 1)} aria-label="Pagina anterior"><ArrowLeft className="h-4 w-4" /></Button>
            <span className="text-sm">{safePage} de {pageCount}</span>
            <Button variant="outline" size="icon" disabled={safePage === pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Proxima pagina"><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </nav>
      )}

      <EditTransactionDialog transaction={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir movimentacao?</AlertDialogTitle><AlertDialogDescription>Essa acao removera permanentemente &quot;{deleting?.description}&quot;.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Detalhes da transacao</AlertDialogTitle></AlertDialogHeader>{viewing && <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-muted-foreground">Descricao</dt><dd className="font-medium">{viewing.description}</dd></div><div><dt className="text-muted-foreground">Valor</dt><dd className="font-medium">{formatCurrency(viewing.amount)}</dd></div><div><dt className="text-muted-foreground">Data</dt><dd>{formatDate(viewing.date)}</dd></div><div><dt className="text-muted-foreground">Categoria</dt><dd>{TRANSACTION_CATEGORIES.find((item) => item.value === viewing.category)?.label}</dd></div>{viewing.attachmentUrl && <div className="col-span-2"><dt className="text-muted-foreground">Comprovante</dt><dd><a href={`/api/files?pathname=${encodeURIComponent(viewing.attachmentUrl)}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 font-medium underline underline-offset-4"><FileText className="h-4 w-4" />{viewing.attachmentName ?? 'Abrir arquivo'}</a></dd></div>}</dl>}<AlertDialogFooter><AlertDialogCancel>Fechar</AlertDialogCancel></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  )
}
