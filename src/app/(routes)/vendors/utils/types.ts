export type VendorFilter = {
  limit?: number;
  page?: number;
  sortBy?: string | string[];
  search?: string;
  searchBy?: string[];
  /** Sent in the request body; the backend uses it as the `where` clause. */
  status?: string;
  isKYCVerified?: boolean;
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
