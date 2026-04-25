import axios from 'config/axios.config';
import { Asset, AssetFilter, AssetResponse } from './types';

export const assetApi = {
  // List all assets (paginated)
  getAll: async () => {
    const result = await axios.get(`/assets`);
    return result.data as AssetResponse;
  },

  // Get asset details
  getOne: async (id: string) => {
    const result = await axios.get(`/assets/${id}`);
    return result.data as Asset;
  },

  // Create a new asset
  create: async (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await axios.post('/assets', data);
    return result.data as Asset;
  },

  // Update asset details
  update: async (
    id: string,
    data: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const result = await axios.put(`/assets/${id}`, data);
    return result.data as Asset;
  },

  // Delete asset
  delete: async (id: string) => {
    const result = await axios.delete(`/assets/${id}`);
    return result.data;
  },

  // Calculate depreciation for a given period
  depreciate: async (id: string, data: { period: string }) => {
    const result = await axios.post(`/assets/${id}/depreciate`, data);
    return result.data;
  },

  // Dispose of an asset
  dispose: async (id: string, disposal_date: string, sale_price: number) => {
    const result = await axios.post(`/assets/${id}/dispose`, null, {
      params: { disposal_date, sale_price },
    });
    return result.data;
  },

  // Get full depreciation schedule for an asset
  getDepreciationSchedule: async (id: string) => {
    const result = await axios.get(`/assets/${id}/depreciation-schedule`);
    return result.data;
  },

  // Transfer asset to a new location
  transferLocation: async (id: string, data: { newLocation: string }) => {
    const result = await axios.patch(`/assets/${id}/transfer-location`, data);
    return result.data;
  },

  // Restore asset
  restore: async (id: string) => {
    const result = await axios.patch(`/assets/restore/${id}`);
    return result.data;
  },
};
