'use client'

import { useEffect, useState } from 'react'
import { useFinance } from '@/lib/finance-context'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const { editTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>('deposito')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('outros')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!transaction) return
    setType(transaction.type)
    setAmount(String(transaction.amount))
    setDescription(transaction.description)
    setDate(transaction.date)
    setCategory(transaction.category)
    setError(null)
  }, [transaction])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!transaction) return
    const numericAmount = Number(amount)
    if (!description.trim() || !date || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Preencha os campos com valores validos.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await editTransaction(transaction.id, {
        type,
        amount: numericAmount,
        description: description.trim(),
        date,
        category,
        attachmentUrl: transaction.attachmentUrl,
        attachmentName: transaction.attachmentName,
      })
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel atualizar a transacao.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar movimentacao</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
              <SelectContent>{TRANSACTION_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-amount">Valor</Label>
            <Input id="edit-amount" type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-description">Descricao</Label>
            <Input id="edit-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={120} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
              <SelectTrigger id="edit-category"><SelectValue /></SelectTrigger>
              <SelectContent>{TRANSACTION_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-date">Data</Label>
            <Input id="edit-date" type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(event) => setDate(event.target.value)} required />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-primary-foreground hover:bg-emerald-700">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
