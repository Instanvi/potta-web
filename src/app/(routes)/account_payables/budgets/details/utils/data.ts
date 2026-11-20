// src/data/mockDashboardData.ts (or similar)
import { Budget, TeamMember, PaymentRequest, PaymentMethod } from './types'; // Adjust path as needed
import {
  Briefcase,
  Landmark,
  Check,
  Wifi,
  CreditCard,
  Smartphone,
} from 'lucide-react'; // Example icons

// Re-use mock budget data if available, or define one:
const mockBudget: Budget = {
  id: 'b1',
  title: 'Back to school budget allocation',
  budgetGoal: 1000000,
  spent: 500000,
  allocated: 1000000,
  available: 300000,
  users: [
    { id: 'u1', imageUrl: 'https://github.com/shadcn.png', initials: 'U1' },
    { id: 'u2', imageUrl: 'https://github.com/vercel.png', initials: 'U2' },
  ],
  currency: 'XAF',
};

const mockTeam: TeamMember[] = [
  {
    id: 't1',
    name: 'Akoh Paul',
    imageUrl: 'https://github.com/shadcn.png',
    initials: 'AP',
  }, // Replace with actual images/initials
  {
    id: 't2',
    name: 'Jessica Paul',
    imageUrl: 'https://github.com/vercel.png',
    initials: 'JP',
  },
  {
    id: 't3',
    name: 'John Palma',
    imageUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    initials: 'JP',
  },
  { id: 't4', name: 'User Four', initials: 'U4' },
  { id: 't5', name: 'User Five', initials: 'U5' },
  { id: 't6', name: 'User Six', initials: 'U6' },
];

// Define payment methods - Mix of specific logos and generic icons
const paymentMethods: { [key: string]: PaymentMethod } = {
  mtn: {
    id: 'mtn',
    name: 'MTN',
    iconUrl: '/icons/mtn-momo.png',
    bgColorClass: 'bg-yellow-100',
    iconColorClass: 'text-yellow-600',
  }, // Add actual icon path
  mastercard: {
    id: 'mc',
    name: 'Mastercard',
    iconUrl: '/icons/mastercard.png',
    bgColorClass: 'bg-red-100',
    iconColorClass: 'text-red-600',
  }, // Add actual icon path
  orange: {
    id: 'orange',
    name: 'Orange Money',
    iconUrl: '/icons/orange-money.png',
    bgColorClass: 'bg-orange-100',
    iconColorClass: 'text-orange-600',
  }, // Add actual icon path
  cash: {
    id: 'cash',
    name: 'Cash',
    iconComponent: Briefcase,
    bgColorClass: 'bg-gray-100',
    iconColorClass: 'text-gray-500',
  },
  bank: {
    id: 'bank',
    name: 'Bank Transfer',
    iconComponent: Landmark,
    bgColorClass: 'bg-blue-100',
    iconColorClass: 'text-blue-600',
  },
  // Add more as needed
};

const mockPaymentRequests: PaymentRequest[] = [
  {
    id: 'p1',
    ref: 'Today',
    date: '10/03/2024',
    madeBy: 'Jonathan Major',
    merchant: 'Eneo CMR',
    amount: 25000,
    currency: 'XAF',
    type: 'out_of_pocket',
    status: 'approved',
    memo: 'Monthly bill',
    account: 'main',
    receiptFiles: [],
    method: paymentMethods.mtn,
  },
  {
    id: 'p2',
    ref: 'REQ002',
    date: '10/03/2024',
    madeBy: 'Aku Joshua',
    merchant: 'Eneo CMR',
    amount: 25000,
    currency: 'XAF',
    type: 'mileage',
    status: 'approved',
    memo: 'Travel reimbursement',
    account: 'travel',
    receiptFiles: [],
    method: paymentMethods.orange,
  },
  {
    id: 'p3',
    ref: 'REQ003',
    date: '10/03/2024',
    madeBy: 'Paul Kwa',
    merchant: 'Eneo CMR',
    amount: 5000,
    currency: 'XAF',
    type: 'out_of_pocket',
    status: 'approved',
    memo: 'Office supplies',
    account: 'main',
    receiptFiles: [],
    method: paymentMethods.mastercard,
  },
  {
    id: 'p4',
    ref: 'REQ004',
    date: '10/03/2024',
    madeBy: 'Paul Kwa',
    merchant: 'Eneo CMR',
    amount: 10000,
    currency: 'XAF',
    type: 'mileage',
    status: 'approved',
    memo: 'Client visit',
    account: 'travel',
    receiptFiles: [],
    method: paymentMethods.orange,
  },
  {
    id: 'p5',
    ref: 'REQ005',
    date: '10/03/2024',
    madeBy: 'Jonathan Major',
    merchant: 'Eneo CMR',
    amount: 75000,
    currency: 'XAF',
    type: 'out_of_pocket',
    status: 'approved',
    memo: 'Annual maintenance',
    account: 'main',
    receiptFiles: [],
    method: paymentMethods.cash,
  },
];

// Export all mock data
export { mockBudget, mockTeam, mockPaymentRequests };
