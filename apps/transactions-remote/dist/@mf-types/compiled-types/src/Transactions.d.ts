import { type Transaction } from '@retni/contracts';
import '@retni/ui/theme.css';
export interface TransactionsProps {
    apiBaseUrl?: string;
    initialTransactions?: Transaction[];
}
export default function Transactions({ apiBaseUrl, initialTransactions }: TransactionsProps): import("react/jsx-runtime").JSX.Element;
