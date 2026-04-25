// src/types/budget.ts (or similar location)
export interface User {
  id: string;
  imageUrl?: string; // Optional image URL
  initials: string; // Fallback initials
}

export interface Budget {
  id: string;
  title: string;
  budgetGoal: number;
  spent: number;
  allocated: number;
  available: number;
  users: User[];
  currency?: string; // Optional currency code
}
