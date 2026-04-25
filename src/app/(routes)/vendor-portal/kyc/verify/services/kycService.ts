import axios from 'config/axios.config';

// Types for KYC API
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

export interface KYCVerificationRequest {
  token: string;
  vendorId: string;
  kycId: string;
}

export interface KYCDocumentUpload {
  type: string;
  file: File;
  documentNumber?: string;
  issuingAuthority?: string;
  expiryDate?: string;
}

export interface KYCSubmissionRequest {
  token: string;
  vendorId: string;
  documents: KYCDocumentUpload[];
}

class KYCService {
  private basePath = '/vendor/kyc';

  /**
   * Get KYC verification details
   */
  async getKYCVerification(request: KYCVerificationRequest): Promise<KYCData> {
    try {
      const response = await axios.get(`${this.basePath}/verify`, {
        params: {
          token: request.token,
          vendorId: request.vendorId,
          kycId: request.kycId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC verification:', error);
      throw error;
    }
  }

  /**
   * Submit KYC documents for verification - uploads each document to the API
   */
  async submitKYCDocuments(request: KYCSubmissionRequest): Promise<any> {
    try {
      // Upload each document individually using the correct API endpoint
      const uploadPromises = request.documents.map(async (doc) => {
        return await this.uploadDocument(
          request.token,
          request.vendorId,
          doc.file,
          doc.type,
          doc.documentNumber,
          doc.issuingAuthority,
          doc.expiryDate
        );
      });

      // Wait for all documents to be uploaded
      const results = await Promise.all(uploadPromises);

      return {
        success: true,
        uploadedDocuments: results,
        message: 'All documents uploaded successfully',
      };
    } catch (error) {
      console.error('Error submitting KYC documents:', error);
      throw error;
    }
  }

  /**
   * Upload individual document - matches API spec
   * POST /api/vendor-portal/documents
   */
  async uploadDocument(
    token: string,
    vendorId: string,
    file: File,
    documentType: string,
    documentNumber?: string,
    issuingAuthority?: string,
    expiryDate?: string
  ): Promise<KYCDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (documentNumber) {
        formData.append('documentNumber', documentNumber);
      }
      if (issuingAuthority) {
        formData.append('issuingAuthority', issuingAuthority);
      }
      if (expiryDate) {
        formData.append('expiryDate', expiryDate);
      }

      const response = await axios.post(
        '/vendor-portal/documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            vendor_id:vendorId,
            token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get KYC verification status
   */
  async getKYCStatus(
    token: string,
    vendorId: string,
    kycId: string
  ): Promise<{
    status: string;
    documents: KYCDocument[];
    lastUpdated: string;
  }> {
    try {
      const response = await axios.get(`${this.basePath}/status`, {
        params: {
          token,
          vendorId,
          kycId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  }

  /**
   * Delete uploaded document
   */
  async deleteDocument(
    token: string,
    vendorId: string,
    kycId: string,
    documentId: string
  ): Promise<void> {
    try {
      await axios.delete(`${this.basePath}/document/${documentId}`, {
        params: {
          token,
          vendorId,
          kycId,
        },
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Resubmit KYC verification
   */
  async resubmitKYC(
    token: string,
    vendorId: string,
    kycId: string
  ): Promise<KYCData> {
    try {
      const response = await axios.post(`${this.basePath}/resubmit`, null, {
        params: {
          token,
          vendorId,
          kycId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error resubmitting KYC:', error);
      throw error;
    }
  }
}

export const kycService = new KYCService();
export default kycService;
