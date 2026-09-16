import { createRoot } from 'react-dom/client'
import Dashboard from './Dashboard'

createRoot(document.getElementById('root')!).render(<div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'Arial, sans-serif' }}><Dashboard apiBaseUrl={import.meta.env.VITE_API_BASE_URL ?? ''} /></div>)
