import { VendorPayload } from './validations';
// import axios from 'config/axios.config';
import axios from 'config/axios.config';
import {
  VendorFilter,
  Vendor,
  VendorResponse,
  VendorKYC,
  KYCDocument,
  KYCDocumentUpload,
  KYCDocumentVerification,
  KYCCompletion,
  VendorPaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  PaymentMethodVerification,
  VendorSearchResponse,
  VendorImportPayload,
  VendorImportResponse,
  VendorKYCStatusFilter,
  KYCResponse,
} from './types';
import { AxiosResponse } from 'axios';

export const vendorApi = {
  create: async (data: VendorPayload) => {
    const result = await axios.post(`/vendor/create`, data, {});
    return result?.data;
  },
  getAll: async (filter: VendorFilter = {}): Promise<VendorResponse> => {
    const queryParams = new URLSearchParams();

    // Add query parameters
    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());
    if (filter.search) queryParams.append('search', filter.search);

    // Handle sortBy parameter (can be string or array)
    if (filter.sortBy) {
      if (Array.isArray(filter.sortBy)) {
        filter.sortBy.forEach((sort) => queryParams.append('sortBy', sort));
      } else {
        queryParams.append('sortBy', filter.sortBy);
      }
    }

    // Handle searchBy parameter
    if (filter.searchBy) {
      filter.searchBy.forEach((field) => queryParams.append('searchBy', field));
    }

    const result = await axios.post(
      `/vendor/filter?${queryParams.toString()}`,
      {}
    );
    return result.data;
  },
  getOne: async (vendor_id: string) => {
    const result = await axios.get<Vendor>(`/vendor/details/${vendor_id}`);
    return result?.data;
  },
  update: async (vendor_id: string, data: unknown) => {
    const result = await axios.put(`/vendor/${vendor_id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        orgId: 'jknjk',
        userId: 'mkkm',
      },
    });
    return result?.data;
  },
  delete: async (vendor_id: string) => {
    const result = await axios.delete(`/vendor/${vendor_id}`);
    return result?.data;
  },

  // Search vendors by name
  search: async (query: string): Promise<VendorSearchResponse> => {
    const result = await axios.get(
      `/vendor/search?q=${encodeURIComponent(query)}`
    );
    return result.data;
  },

  // Import vendors from CSV
  importCsv: async (
    data: VendorImportPayload
  ): Promise<VendorImportResponse> => {
    if (data.file) {
      const formData = new FormData();
      formData.append('file', data.file);

      const result = await axios.post('/vendor/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return result.data;
    } else if (data.s3Key) {
      const result = await axios.post('/vendor/import-csv', {
        s3Key: data.s3Key,
      });
      return result.data;
    } else {
      throw new Error('Either file or s3Key must be provided');
    }
  },

  // Get vendors by KYC verification status
  getByKYCStatus: async (
    filter: VendorKYCStatusFilter
  ): Promise<VendorResponse> => {
    const queryParams = new URLSearchParams();

    // Add query parameters
    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());
    if (filter.search) queryParams.append('search', filter.search);

    // Handle sortBy parameter (can be string or array)
    if (filter.sortBy) {
      if (Array.isArray(filter.sortBy)) {
        filter.sortBy.forEach((sort) => queryParams.append('sortBy', sort));
      } else {
        queryParams.append('sortBy', filter.sortBy);
      }
    }

    // Handle searchBy parameter
    if (filter.searchBy) {
      filter.searchBy.forEach((field) => queryParams.append('searchBy', field));
    }

    const result = await axios.post(
      `/vendor/kyc-status/${filter.isKYCVerified}?${queryParams.toString()}`,
      {}
    );
    return result.data;
  },

  // KYC Endpoints
  kyc: {
    // Initialize KYC process for a vendor
    initialize: async (vendorId: string): Promise<VendorKYC> => {
      const result = await axios.post(`/vendors/${vendorId}/kyc/initialize`);
      return result?.data;
    },

    // Get KYC status and documents for a vendor
    getStatus: async (vendorId: string): Promise<KYCResponse> => {
      const result = await axios.get(`/vendors/${vendorId}/kyc`);
      return result?.data;
    },

    // Complete KYC verification for a vendor
    complete: async (
      vendorId: string,
      data: KYCCompletion
    ): Promise<VendorKYC> => {
      const result = await axios.put(`/vendors/${vendorId}/kyc/complete`, data);
      return result?.data;
    },

    // Upload KYC document for a vendor
    uploadDocument: async (
      vendorId: string,
      data: KYCDocumentUpload
    ): Promise<KYCDocument> => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('documentType', data.documentType);
      if (data.documentNumber)
        formData.append('documentNumber', data.documentNumber);
      if (data.issuingAuthority)
        formData.append('issuingAuthority', data.issuingAuthority);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);

      const result = await axios.post(
        `/vendors/${vendorId}/kyc/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return result?.data;
    },

    // Verify a KYC document manually
    verifyDocument: async (
      vendorId: string,
      documentId: string,
      data: KYCDocumentVerification
    ): Promise<KYCDocument> => {
      const result = await axios.put(
        `/vendors/${vendorId}/kyc/documents/${documentId}/verify`,
        data
      );
      return result?.data;
    },

    // Delete a KYC document
    deleteDocument: async (
      vendorId: string,
      documentId: string
    ): Promise<void> => {
      await axios.delete(`/vendors/${vendorId}/kyc/documents/${documentId}`);
    },

    // Get all pending documents for admin review
    getPendingDocuments: async (vendorId: string): Promise<KYCDocument[]> => {
      const result = await axios.get(
        `/vendors/${vendorId}/kyc/documents/pending`
      );
      return result?.data;
    },

    // Get vendors with expiring documents
    getExpiringDocuments: async (
      vendorId: string,
      days?: number
    ): Promise<KYCDocument[]> => {
      const params = days ? { days } : {};
      const result = await axios.get(
        `/vendors/${vendorId}/kyc/documents/expiring`,
        { params }
      );
      return result?.data;
    },

    // Get documents by type for a vendor
    getDocumentsByType: async (
      vendorId: string,
      documentType: string
    ): Promise<KYCDocument[]> => {
      const result = await axios.get(
        `/vendors/${vendorId}/kyc/documents/type/${documentType}`
      );
      return result?.data;
    },
  },

  // Payment Methods Endpoints
  paymentMethods: {
    // Create a new payment method for a vendor
    create: async (
      vendorId: string,
      data: CreatePaymentMethodPayload
    ): Promise<VendorPaymentMethod> => {
      const result = await axios.post(
        `/vendors/${vendorId}/payment-methods`,
        data
      );
      return result?.data;
    },

    // Get all payment methods for a vendor
    getAll: async (vendorId: string): Promise<VendorPaymentMethod[]> => {
      const result = await axios.get(`/vendors/${vendorId}/payment-methods`);
      return result?.data;
    },

    // Get primary payment method for a vendor
    getPrimary: async (
      vendorId: string
    ): Promise<VendorPaymentMethod | null> => {
      const result = await axios.get(
        `/vendors/${vendorId}/payment-methods/primary`
      );
      return result?.data;
    },

    // Get active payment methods for a vendor
    getActive: async (vendorId: string): Promise<VendorPaymentMethod[]> => {
      const result = await axios.get(
        `/vendors/${vendorId}/payment-methods/active`
      );
      return result?.data;
    },

    // Get payment methods by type for a vendor
    getByType: async (
      vendorId: string,
      paymentMethodType: string
    ): Promise<VendorPaymentMethod[]> => {
      const result = await axios.get(
        `/vendors/${vendorId}/payment-methods/type/${paymentMethodType}`
      );
      return result?.data;
    },

    // Get a specific payment method
    getOne: async (
      vendorId: string,
      paymentMethodId: string
    ): Promise<VendorPaymentMethod> => {
      const result = await axios.get(
        `/vendors/${vendorId}/payment-methods/${paymentMethodId}`
      );
      return result?.data;
    },

    // Update a payment method
    update: async (
      vendorId: string,
      paymentMethodId: string,
      data: UpdatePaymentMethodPayload
    ): Promise<VendorPaymentMethod> => {
      const result = await axios.put(
        `/vendors/${vendorId}/payment-methods/${paymentMethodId}`,
        data
      );
      return result?.data;
    },

    // Delete a payment method
    delete: async (
      vendorId: string,
      paymentMethodId: string
    ): Promise<void> => {
      await axios.delete(
        `/vendors/${vendorId}/payment-methods/${paymentMethodId}`
      );
    },

    // Verify a payment method
    verify: async (
      vendorId: string,
      paymentMethodId: string,
      data: PaymentMethodVerification
    ): Promise<VendorPaymentMethod> => {
      const result = await axios.put(
        `/vendors/${vendorId}/payment-methods/${paymentMethodId}/verify`,
        data
      );
      return result?.data;
    },

    // Set a payment method as primary
    setPrimary: async (
      vendorId: string,
      paymentMethodId: string
    ): Promise<VendorPaymentMethod> => {
      const result = await axios.put(
        `/vendors/${vendorId}/payment-methods/${paymentMethodId}/set-primary`
      );
      return result?.data;
    },
  },
};
