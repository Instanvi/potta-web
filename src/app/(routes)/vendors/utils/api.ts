import { VendorPayload } from './validations';
import axios from 'config/axios.config';
import {
  VendorFilter,
  Vendor,
  VendorResponse,
  VendorSearchResponse,
  VendorImportPayload,
  VendorImportResponse,
  VendorKYCStatusFilter,
} from './types';

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
    const result = await axios.put(`/vendor/${vendor_id}`, data);
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
};
