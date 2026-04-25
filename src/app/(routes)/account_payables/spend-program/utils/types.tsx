export type QuestionType =
  | 'text'
  | 'paragraph'
  | 'boolean'
  | 'number'
  | 'date'
  | 'link'
  | 'email'
  | 'single_select'
  | 'multi_select'
  | 'file_upload'
  | 'address'
  | 'contact'
  // Department fields
  | 'billing_contact'
  | 'billing_address'
  | 'net_payment_terms'
  | 'vendor_address'
  | 'vendor_contact'
  | 'promise_date'
  | 'shipping_date'
  | 'ship_to_address'
  | 'memo'
  | 'attachments'
  | 'vendor';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  alwaysAsk?: boolean;
  mapping?: string;
  options?: string[]; // for select types
  // Add more type-specific fields as needed
}

// Backend form structure (simplified)
export interface BackendFormField {
  field: string;
  type: string;
}

// Pre-spend controls interface
export interface PreSpendControls {
  // Employee access controls
  allowEmployees?: 'all' | 'specific';
  selectedEmployees?: string[]; // Array of employee UUIDs
  // Approval controls - approver can be 'manager', 'custom', or any role name from database
  approver?: string; // 'manager' | 'custom' | role name from org roles
  selectedApprovers?: string[]; // Array of role names (when approver is 'custom')
  // Payment controls
  paymentMethod?: 'purchase_order' | 'credit_card' | 'bank_transfer';
  canChangePayment?: 'yes' | 'no';
  approvalPolicy?: string;
  // Legacy fields for backward compatibility
  requireApproval?: boolean;
  maxAmount?: number;
  limit?: number;
}

// Spend Program Types
export type SpendProgramType = 'PROCUREMENT' | 'CARD';
export type SpendProgramStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Main Spend Program interface
export interface SpendProgram {
  id: string;
  type: SpendProgramType;
  name: string;
  description: string;
  status: SpendProgramStatus;
  unit: string;
  purchaseOrders: number;
  form: BackendFormField[];
  preSpendControls: PreSpendControls;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateSpendProgramDTO {
  type: SpendProgramType;
  name: string;
  description?: string;
  status?: SpendProgramStatus;
  unit?: string;
  purchaseOrders?: number;
  form?: BackendFormField[];
  preSpendControls?: PreSpendControls;
}

export interface UpdateSpendProgramDTO {
  type?: SpendProgramType;
  name?: string;
  description?: string;
  status?: SpendProgramStatus;
  unit?: string;
  purchaseOrders?: number;
  form?: BackendFormField[];
  preSpendControls?: PreSpendControls;
}

// Frontend form state for building forms
export interface FormBuilderState {
  questions: FormQuestion[];
}

// Program type options for creation
export interface ProgramTypeOption {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  plus?: boolean;
}
