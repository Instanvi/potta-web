// src/data/mockDashboardData.ts (or similar)
import {
  Budget as LocalBudget,
  TeamMember,
  PaymentRequest,
  PaymentMethod,
} from './types'; // Adjust path as needed
import { Budget } from '../../utils/types'; // Import the actual Budget type
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
  uuid: 'b1',
  budgetId: 'BUD-001',
  name: 'Back to school budget allocation',
  description: 'Budget for back to school supplies and activities',
  totalAmount: '1000000',
  availableAmount: '300000',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'APPROVED',
  organizationId: 'org-1',
  branchId: 'branch-1',
  approvalRequirement: 'one',
  requiredApprovals: 1,
  budgetedAccountId: 'acc-1',
  recurrenceType: 'NONE',
  recurrenceInterval: null,
  recurrenceEndDate: null,
  originalBudgetId: null,
  isRecurringParent: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: null,
  updatedBy: null,
  deletedAt: null,
  budgetedAccount: {
    uuid: 'acc-1',
    name: 'General Budget Account',
    code: 'GBA-001',
    type: 'EXPENSE',
    isActive: true,
    initialBalance: '1000000',
    branchId: 'branch-1',
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: null,
    updatedBy: null,
    deletedAt: null,
    path: null,
  },
  policies: [],
  approvers: [
    {
      uuid: 'app-1',
      budgetId: 'b1',
      approverId: 'u1',
      approver: {
        firstName: 'John',
        lastName: 'Doe',
        profile_url: 'https://github.com/shadcn.png',
      },
      approved: true,
      branchId: 'branch-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    },
    {
      uuid: 'app-2',
      budgetId: 'b1',
      approverId: 'u2',
      approver: {
        firstName: 'Jane',
        lastName: 'Smith',
        profile_url: 'https://github.com/vercel.png',
      },
      approved: false,
      branchId: 'branch-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    },
  ],
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
    madeTo: 'Eneo CMR',
    category: 'Office Cleaning',
    amount: 25000,
    currency: 'XAF',
    method: paymentMethods.mtn,
    status: 'Approved',
  },
  {
    id: 'p2',
    ref: 'REQ002',
    date: '10/03/2024',
    madeBy: 'Aku Joshua',
    madeTo: 'Eneo CMR',
    category: 'Office Cleaning',
    amount: 25000,
    currency: 'XAF',
    method: paymentMethods.orange,
    status: 'Approved',
  },
  {
    id: 'p3',
    ref: 'REQ003',
    date: '10/03/2024',
    madeBy: 'Paul Kwa',
    madeTo: 'Eneo CMR',
    category: 'Office Cleaning',
    amount: 5000,
    currency: 'XAF',
    method: paymentMethods.mastercard,
    status: 'Approved',
  },
  {
    id: 'p4',
    ref: 'REQ004',
    date: '10/03/2024',
    madeBy: 'Paul Kwa',
    madeTo: 'Eneo CMR',
    category: 'Office Cleaning',
    amount: 10000,
    currency: 'XAF',
    method: paymentMethods.orange,
    status: 'Approved',
  },
  {
    id: 'p5',
    ref: 'REQ005',
    date: '10/03/2024',
    madeBy: 'Jonathan Major',
    madeTo: 'Eneo CMR',
    category: 'Office Cleaning',
    amount: 75000,
    currency: 'XAF',
    method: paymentMethods.cash,
    status: 'Approved',
  },
];

// Export all mock data
export { mockBudget, mockTeam, mockPaymentRequests };
