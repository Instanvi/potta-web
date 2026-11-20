export type VendorFilter = {
  limit?: number;
  page?: number;
  sortBy?: string | string[];
  search?: string;
  searchBy?: string[];
};

export type Vendor = {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  userId: string | null;
  vendorId: string;
  type: string;
  name: string;
  paymentTerms: string | null;
  paymentMethod: string | null;
  accountDetails: string | null;
  openingBalance: string | null;
  currency: string;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  website: string | null;
  taxId: string | null;
  classification: string;
  notes: string | null;
  industry: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  locationContextId: string;
  subLedgerId: string;
  accountId: string;
  creditLimit: string;
  lastSynced: string | null;
  isKYCVerified: boolean;
  hasKYCInitialized?: boolean; // Whether KYC process has been started
  address: {
    uuid: string;
    orgId: string | null;
    createdAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: string | null;
    updatedAt: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
    geospatialLocation: string | null;
  };
};

export interface VendorResponse {
  data: Vendor[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: Array<[string, 'ASC' | 'DESC']>;
  };
  links: {
    current: string;
  };
}

// KYC Types
export interface VendorKYC {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  vendorId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredDocuments: string[];
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationScore: number | null;
  verificationNotes: string | null;
  locationContextId: string;
}

export interface KYCDocument {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  vendorId: string;
  kycId: string | null;
  documentType: DocumentType;
  key: string;
  documentUrl: string;
  documentNumber: string | null;
  issuingAuthority: string | null;
  expiryDate: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNotes: string | null;
  locationContextId: string;
}

export type DocumentType =
  | 'BUSINESS_REGISTRATION'
  | 'TAX_CLEARANCE'
  | 'BANK_STATEMENT'
  | 'FOOD_LICENSE'
  | 'CONSTRUCTION_LICENSE'
  | 'TRANSPORT_LICENSE'
  | 'FINANCIAL_LICENSE'
  | 'MEDICAL_LICENSE'
  | 'HEALTH_CERTIFICATE'
  | 'INSURANCE_CERTIFICATE'
  | 'VEHICLE_REGISTRATION'
  | 'CREDIT_REPORT'
  | 'IDENTITY_DOCUMENT'
  | 'ADDRESS_PROOF'
  | 'OTHER';

export interface KYCResponse {
  kyc: VendorKYC;
  documents: KYCDocument[];
}

export interface KYCDocumentUpload {
  file: File;
  documentType: DocumentType;
  documentNumber?: string;
  issuingAuthority?: string;
  expiryDate?: string;
}

export interface KYCDocumentVerification {
  status: 'APPROVED' | 'REJECTED';
  notes: string;
}

export interface KYCCompletion {
  status: 'APPROVED' | 'REJECTED';
  notes: string;
}

// Payment Methods Types
export interface VendorPaymentMethod {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  vendorId: string;
  paymentMethodType: PaymentMethodType;
  accountName: string;
  accountNumber: string | null;
  bankName: string | null;
  bankCode: string | null;
  swiftCode: string | null;
  iban: string | null;
  phoneNumber: string | null;
  walletId: string | null;
  cardNumber: string | null;
  cardType: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  isPrimary: boolean;
  isActive: boolean;
  dailyLimit: string;
  monthlyLimit: string;
  notes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNotes: string | null;
  locationContextId: string;
}

export type PaymentMethodType =
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'ACH_TRANSFER'
  | 'MOBILE_MONEY'
  | 'DIGITAL_WALLET'
  | 'CASH'
  | 'CREDIT'
  | 'OTHER';

export interface CreatePaymentMethodPayload {
  paymentMethodType: PaymentMethodType;
  accountName: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  swiftCode?: string;
  iban?: string;
  phoneNumber?: string;
  walletId?: string;
  cardNumber?: string;
  cardType?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdatePaymentMethodPayload {
  paymentMethodType?: PaymentMethodType;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  swiftCode?: string;
  iban?: string;
  phoneNumber?: string;
  walletId?: string;
  cardNumber?: string;
  cardType?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  dailyLimit?: number;
  monthlyLimit?: number;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  verificationNotes?: string;
}

export interface PaymentMethodVerification {
  paymentMethodType?: PaymentMethodType;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  swiftCode?: string;
  iban?: string;
  phoneNumber?: string;
  walletId?: string;
  cardNumber?: string;
  cardType?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  dailyLimit?: number;
  monthlyLimit?: number;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  verificationNotes?: string;
}

// Additional Vendor API Types
export interface VendorSearchResponse {
  data: Vendor[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface VendorImportPayload {
  file?: File;
  s3Key?: string;
}

export interface VendorImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  errors?: string[];
}

export interface VendorKYCStatusFilter {
  isKYCVerified: boolean;
  page?: number;
  limit?: number;
  sortBy?: string | string[];
  search?: string;
  searchBy?: string[];
}
