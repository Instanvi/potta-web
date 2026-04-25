
export interface Approver {
  id: string;
  name: string;
  // avatarUrl?: string; // Optional: if you want to display avatars later
}

export type RuleCondition = 'Is Above' | 'Below' | 'Equals'; // Add more as needed
export type RuleField = 'Transaction Amount'; // Add more as needed
export type Currency = 'USD' | 'XAF' | 'EUR'; // Add more as needed

export interface Rule {
  id: string; // Unique ID for React keys
  field: RuleField;
  condition: RuleCondition;
  value: string; // Keep as string for input binding, parse when needed
  currency: Currency;
}

export interface PolicyState {
  rules: Rule[];
  eitherByApprovers: Approver[];
  allByApprovers: Approver[];
  policyName: string;
  // You might also need state for the selected approver type in the dropdowns,
  // and the selected person in the 'Mark Pence' dropdowns if they are functional.
}