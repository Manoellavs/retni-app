import { createRoot } from 'react-dom/client'
import Transactions from './Transactions'

createRoot(document.getElementById('root')!).render(<div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'Arial, sans-serif' }}><Transactions apiBaseUrl={import.meta.env.VITE_API_BASE_URL ?? ''} /></div>)
