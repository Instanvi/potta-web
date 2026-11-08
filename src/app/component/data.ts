import {
  BookOpen,
  ChartLine,
  Coins,
  FileText,
  Landmark,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { GridItem } from './types';

export const gridItems: GridItem[] = [
  { value: 'pos', label: 'POS', icon: ShoppingCart },
  { value: 'accounting', label: 'Books', icon: BookOpen },
  { value: 'account_receivables/invoice', label: 'Sales', icon: FileText },
  { value: 'account_payables/purchase', label: 'Purchasing', icon: Truck },
  { value: 'treasury/bank-accounts', label: 'Treasury', icon: Landmark },
];

export const mostUsedApps: GridItem[] = [
  { value: 'pos', label: 'POS register', icon: ShoppingCart },
  { value: 'account_receivables/invoice', label: 'Invoices', icon: FileText },
  { value: 'accounting/cashbook', label: 'Cashbook', icon: Coins },
  { value: 'accounting/reports', label: 'Reports', icon: ChartLine },
];
