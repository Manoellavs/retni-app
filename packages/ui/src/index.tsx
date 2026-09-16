import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Receipt } from 'lucide-react'

export function Button({ variant = 'default', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }) {
  return <button className="retni-button" data-variant={variant} {...props} />
}

export function Card(props: HTMLAttributes<HTMLElement>) {
  return <section className="retni-card" {...props} />
}

export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className="retni-badge" {...props} />
}

export const Dialog = forwardRef<HTMLDialogElement, { title: string; children: ReactNode; onClose?: () => void }>(
  function Dialog({ title, children, onClose }, ref) {
    return <dialog ref={ref} className="retni-dialog" onClose={onClose}>
      <div style={{ padding: 20 }}><h2 style={{ marginTop: 0 }}>{title}</h2>{children}</div>
    </dialog>
  },
)

export const transactionIcons = {
  deposito: ArrowDownLeft,
  transferencia: ArrowUpRight,
  pagamento: Receipt,
  saque: CreditCard,
}

export const theme = {
  brand: 'var(--retni-brand)',
  danger: 'var(--retni-danger)',
  muted: 'var(--retni-muted)',
} as const
