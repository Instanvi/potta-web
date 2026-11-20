// src/types/dashboard.ts (or a suitable location like types/payment.ts, types/team.ts)

// Re-use or import Budget type if defined elsewhere
export interface Budget {
  id: string;
  title: string;
  budgetGoal: number;
  spent: number;
  allocated: number;
  available: number;
  users: { id: string; imageUrl?: string; initials: string }[];
  currency?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  imageUrl?: string; // Use image if available
  initials: string; // Fallback
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconUrl?: string; // URL for specific logos (like MTN, Mastercard)
  iconComponent?: React.ElementType; // Or a Lucide icon component
  bgColorClass?: string; // Background for the icon circle
  iconColorClass?: string; // Color for the icon itself
}

export interface PaymentRequest {
  id: string;
  ref: string; // Or maybe a number/ID? Displaying 'Today' suggests flexibility
  date: string; // e.g., '10/03/2024'
  madeBy: string;
  madeTo: string;
  category: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'Approved' | 'Pending' | 'Rejected'; // Assuming 'Approved' based on button
}
