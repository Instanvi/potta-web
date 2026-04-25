// src/data/mockBudgets.ts (or similar location)

import { Budget, User } from "../new/types/budget";


const users: User[] = [
  { id: 'u1', imageUrl: 'https://github.com/shadcn.png', initials: 'U1' }, // Replace with actual URLs or leave undefined
  { id: 'u2', imageUrl: 'https://github.com/vercel.png', initials: 'U2' }, // Replace with actual URLs or leave undefined
  { id: 'u3', initials: 'U3' },
  { id: 'u4', initials: 'U4' },
];

export const mockBudgets: Budget[] = [
  {
    id: 'b1',
    title: 'Back to school budget allocation',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000, // Assuming allocated is the same as goal here
    available: 300000, // Using the value shown in the UI
    users: users,
    currency: 'XAF',
  },
  {
    id: 'b2',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users.slice(0, 2), // Different users for variety
    currency: 'XAF',
  },
  {
    id: 'b3',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users,
    currency: 'XAF',
  },
  {
    id: 'b4',
    title: 'Back to school budget allocation',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users.slice(1, 3),
    currency: 'XAF',
  },
  {
    id: 'b5',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users,
    currency: 'XAF',
  },
  {
    id: 'b6',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users.slice(0, 1),
    currency: 'XAF',
  },
  {
    id: 'b7',
    title: 'Back to school budget allocation',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000, // Assuming allocated is the same as goal here
    available: 300000, // Using the value shown in the UI
    users: users,
    currency: 'XAF',
  },
  {
    id: 'b8',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users.slice(0, 2), // Different users for variety
    currency: 'XAF',
  },
  {
    id: 'b9',
    title: 'School Running Budget',
    budgetGoal: 1000000,
    spent: 500000,
    allocated: 1000000,
    available: 300000,
    users: users,
    currency: 'XAF',
  },
  // Add more mock budgets as needed, repeating the pattern
];
