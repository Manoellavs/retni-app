'use client'

import { useState } from 'react'
import { FileUp, Plus, X } from 'lucide-react'
import { useFinance } from '@/lib/finance-context'
import { suggestCategory } from '@/lib/category-suggestion'
import { uploadAttachment } from '@/app/actions/upload'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type TransactionCategory,
  type TransactionType,
} from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function NewTransactionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { addTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('deposito')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<TransactionCategory>('outros')
  const [categoryWasChanged, setCategoryWasChanged] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const updateDescription = (value: string) => {
    setDescription(value)
    if (!categoryWasChanged) setCategory(suggestCategory(value))
  }

  const reset = () => {
    setType('deposito')
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('outros')
    setCategoryWasChanged(false)
    setFile(null)
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!description.trim() || !date || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Preencha todos os campos obrigatorios com valores validos.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      let attachmentUrl: string | null = null
      let attachmentName: string | null = null
      if (file) {
        const formData = new FormData()
        formData.set('file', file)
        const attachment = await uploadAttachment(formData)
        attachmentUrl = attachment.url
        attachmentName = attachment.name
      }
      await addTransaction({
        type,
        amount: numericAmount,
        description: description.trim(),
        date,
        category,
        attachmentUrl,
        attachmentName,
      })
      reset()
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar a transacao.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset() }}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="gap-2 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"><Plus className="h-4 w-4" aria-hidden="true" />Nova</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nova transacao</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger id="new-type"><SelectValue /></SelectTrigger>
              <SelectContent>{TRANSACTION_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-amount">Valor</Label>
            <Input id="new-amount" type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-description">Descricao</Label>
            <Input id="new-description" value={description} onChange={(event) => updateDescription(event.target.value)} maxLength={120} placeholder="Ex.: Mercado do bairro" required />
            <p className="text-xs text-muted-foreground">A categoria e sugerida automaticamente pela descricao.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-category">Categoria</Label>
            <Select value={category} onValueChange={(value) => { setCategory(value as TransactionCategory); setCategoryWasChanged(true) }}>
              <SelectTrigger id="new-category"><SelectValue /></SelectTrigger>
              <SelectContent>{TRANSACTION_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-date">Data</Label>
            <Input id="new-date" type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(event) => setDate(event.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-attachment">Comprovante (opcional)</Label>
            <Input id="new-attachment" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ou PDF, ate 5 MB.</p>
            {file && <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-2"><FileUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{file.name}</span></span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)} aria-label="Remover comprovante"><X className="h-3.5 w-3.5" /></Button></div>}
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-primary-foreground hover:bg-emerald-700">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
