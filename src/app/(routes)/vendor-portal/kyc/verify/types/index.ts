export interface KYCTokenData {
  token: string;
  vendorId: string;
  kycId: string;
}

export interface KYCDocument {
  id: string;
  type: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  url?: string;
  rejectionReason?: string;
  uploadedAt?: string;
}

export interface KYCVendor {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
  address?: string;
}

export interface KYCData {
  id: string;
  vendorId: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  documents: KYCDocument[];
  vendor: KYCVendor;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  id: string;
  type: string;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number; // in MB
}

export interface KYCDocumentUpload {
  type: string;
  file: File;
}

export interface KYCSubmissionRequest {
  token: string;
  vendorId: string;
  kycId: string;
  documents: KYCDocumentUpload[];
}

export interface KYCVerificationRequest {
  token: string;
  vendorId: string;
  kycId: string;
}

export interface KYCStatusResponse {
  status: string;
  documents: KYCDocument[];
  lastUpdated: string;
}

export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type DocumentStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';

