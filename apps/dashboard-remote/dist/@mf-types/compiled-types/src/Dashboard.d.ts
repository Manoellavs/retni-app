import { type Transaction } from '@retni/contracts';
import '@retni/ui/theme.css';
export interface DashboardProps {
    apiBaseUrl?: string;
    initialTransactions?: Transaction[];
    userName?: string;
}
export default function Dashboard({ apiBaseUrl, initialTransactions, userName }: DashboardProps): import("react/jsx-runtime").JSX.Element;
