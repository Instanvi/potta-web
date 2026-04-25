// Procurement Types

export type SpendRequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';
export type SpendRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RFQStatus = 'DRAFT' | 'SENT' | 'RESPONSES_RECEIVED' | 'CLOSED';

export interface SpendRequestItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  category: string;
  specifications?: string;
  vendorId?: string;
}

export interface SpendRequest {
  id?: string;
  uuid?: string;
  requestNumber?: string;
  title: string;
  description: string;
  requestedAmount: number;
  status?: SpendRequestStatus;
  priority: SpendRequestPriority;
  items: SpendRequestItem[];
  justification: string;
  requiredDate: string;
  requestedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  comments?: string;
  spendProgramId: string;
  budgetId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RFQRequirementItem {
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
  category: string;
}

export interface RFQRequirements {
  items: RFQRequirementItem[];
  deliveryDate: string;
  deliveryLocation: string;
  qualityStandards?: string[];
  certifications?: string[];
  warranty?: string;
  paymentTerms?: string;
  otherRequirements?: string;
}

export interface RFQTerms {
  deliveryTerms?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  penaltyClause?: string;
  forceMajeure?: string;
  disputeResolution?: string;
}

export interface RFQ {
  id?: string;
  uuid?: string;
  rfqNumber?: string;
  title: string;
  description: string;
  deadline: string;
  status?: RFQStatus;
  requirements: RFQRequirements;
  terms?: RFQTerms;
  instructions?: string;
  sentAt?: string;
  sentBy?: string;
  vendorList?: string[];
  spendRequestId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpendRequestFilter {
  status?: SpendRequestStatus;
  priority?: SpendRequestPriority;
}

export interface RFQFilter {
  status?: RFQStatus;
}

export interface ApprovalAction {
  comments?: string;
}

export interface RejectionAction {
  rejectionReason: string;
}

export interface SendRFQPayload {
  message: string;
}

export interface CloseRFQPayload {
  reason: string;
}
