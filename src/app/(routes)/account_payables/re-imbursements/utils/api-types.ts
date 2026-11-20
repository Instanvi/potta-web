// Reimbursement API Types based on the provided API documentation

export interface Reimbursement {
  uuid: string;
  employeeId: string;
  amount: number;
  type: ReimbursementType;
  expenseType: string;
  description: string;
  status: ReimbursementStatus;
  approvalDate?: string;
  paymentDate?: string;
  journalEntryId?: string;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReimbursementType =
  | 'mileage'
  | 'out-of-pocket'
  | 'travel'
  | 'meals'
  | 'accommodation'
  | 'other';

export type ReimbursementStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface CreateReimbursementRequest {
  employeeId: string;
  amount: number;
  type: ReimbursementType;
  expenseType: string;
  description: string;
}

export interface ApproveReimbursementRequest {
  reimbursementId: string;
  approverId: string;
}

export interface PayReimbursementRequest {
  reimbursementId: string;
  paymentRef: string;
}

export interface ReimbursementResponse {
  data: Reimbursement[];
  total: number;
  page: number;
  limit: number;
}

// Employee interface for dropdowns
export interface Employee {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
}

// Expense type options for dropdowns
export const EXPENSE_TYPE_OPTIONS = {
  mileage: [
    { label: 'Fuel', value: 'Fuel' },
    { label: 'Vehicle Maintenance', value: 'Vehicle Maintenance' },
    { label: 'Parking', value: 'Parking' },
    { label: 'Tolls', value: 'Tolls' },
  ],
  out_of_pocket: [
    { label: 'Office Supplies', value: 'Office Supplies' },
    { label: 'Client Entertainment', value: 'Client Entertainment' },
    { label: 'Training Materials', value: 'Training Materials' },
    { label: 'Software Licenses', value: 'Software Licenses' },
  ],
  travel: [
    { label: 'Flight', value: 'Flight' },
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Meals', value: 'Meals' },
  ],
  meals: [
    { label: 'Business Lunch', value: 'Business Lunch' },
    { label: 'Client Dinner', value: 'Client Dinner' },
    { label: 'Team Meeting', value: 'Team Meeting' },
  ],
  accommodation: [
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Airbnb', value: 'Airbnb' },
    { label: 'Conference Venue', value: 'Conference Venue' },
  ],
  other: [
    { label: 'Miscellaneous', value: 'Miscellaneous' },
    { label: 'Emergency', value: 'Emergency' },
  ],
};

export const REIMBURSEMENT_TYPE_OPTIONS = [
  { label: 'Mileage', value: 'mileage' },
  { label: 'Out of Pocket', value: 'out-of-pocket' },
  // { label: 'Other', value: 'other' },
];

export const REIMBURSEMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Paid', value: 'PAID' },
];

export const REIMBURSEMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  PAID: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const REIMBURSEMENT_TYPE_COLORS = {
  mileage: 'bg-blue-100 text-blue-800 border-blue-200',
  'out-of-pocket': 'bg-purple-100 text-purple-800 border-purple-200',
  travel: 'bg-green-100 text-green-800 border-green-200',
  meals: 'bg-orange-100 text-orange-800 border-orange-200',
  accommodation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};
