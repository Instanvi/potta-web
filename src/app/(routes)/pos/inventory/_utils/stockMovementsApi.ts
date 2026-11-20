import axios from 'config/axios.config';
import type { Product } from './types';

export type ReturnReason =
  | 'DEFECTIVE_PRODUCT'
  | 'WRONG_ITEM'
  | 'CUSTOMER_REQUEST'
  | 'DAMAGED_IN_TRANSIT'
  | 'EXPIRED_PRODUCT'
  | 'OTHER';
export type ReturnStatus = 'PENDING' | 'PROCESSED' | 'CANCELLED' | 'REJECTED';

export type AdjustmentType =
  | 'INVENTORY_COUNT'
  | 'COST_ADJUSTMENT'
  | 'QUALITY_ADJUSTMENT'
  | 'SYSTEM_CORRECTION'
  | 'PHYSICAL_DAMAGE'
  | 'EXPIRATION'
  | 'OTHER';
export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const RETURN_REASON_OPTIONS: { value: ReturnReason; label: string }[] = [
  { value: 'CUSTOMER_REQUEST', label: 'Customer request' },
  { value: 'DEFECTIVE_PRODUCT', label: 'Defective product' },
  { value: 'WRONG_ITEM', label: 'Wrong item' },
  { value: 'DAMAGED_IN_TRANSIT', label: 'Damaged in transit' },
  { value: 'EXPIRED_PRODUCT', label: 'Expired product' },
  { value: 'OTHER', label: 'Other' },
];

export const ADJUSTMENT_TYPE_OPTIONS: { value: AdjustmentType; label: string }[] = [
  { value: 'INVENTORY_COUNT', label: 'Stock count' },
  { value: 'PHYSICAL_DAMAGE', label: 'Damage' },
  { value: 'EXPIRATION', label: 'Expired' },
  { value: 'QUALITY_ADJUSTMENT', label: 'Quality' },
  { value: 'COST_ADJUSTMENT', label: 'Cost change' },
  { value: 'SYSTEM_CORRECTION', label: 'Correction' },
  { value: 'OTHER', label: 'Other' },
];

export const labelOf = (options: { value: string; label: string }[], value?: string | null) =>
  options.find((o) => o.value === value)?.label ?? value ?? '—';

type ProductRef = Pick<Product, 'uuid' | 'name'> & { sku?: string | null; inventoryLevel?: number; cost?: number };

export interface ProductReturn {
  uuid: string;
  productId: string;
  product?: ProductRef | null;
  quantity: number;
  reason: ReturnReason;
  status: ReturnStatus;
  notes?: string | null;
  referenceTransaction?: string | null;
  restockItems: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductAdjustment {
  uuid: string;
  productId: string;
  product?: ProductRef | null;
  adjustmentType: AdjustmentType;
  status: AdjustmentStatus;
  quantityAdjustment: number;
  costAdjustment?: number | string | null;
  reason: string;
  notes?: string | null;
  referenceDocument?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Paged<T> {
  data: T[];
  meta: { itemsPerPage: number; totalItems: number; currentPage: number; totalPages: number };
}

export interface MovementListParams {
  page: number;
  limit: number;
  status?: string;
  type?: string;
  search?: string;
}

export interface CreateReturnPayload {
  productId: string;
  quantity: number;
  reason: ReturnReason;
  restockItems: boolean;
  notes?: string;
  referenceTransaction?: string;
}

export interface CreateAdjustmentPayload {
  productId: string;
  adjustmentType: AdjustmentType;
  quantityAdjustment: number;
  costAdjustment?: number;
  reason: string;
  notes?: string;
  referenceDocument?: string;
}

const clean = (params: MovementListParams) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const stockMovementsApi = {
  listReturns: async (params: MovementListParams) =>
    (await axios.get<Paged<ProductReturn>>('/Item/returns', { params: clean(params) })).data,
  createReturn: async (payload: CreateReturnPayload) =>
    (await axios.post<ProductReturn>('/Item/returns', payload)).data,
  processReturn: async (id: string) => (await axios.post(`/Item/returns/${id}/process`)).data,
  rejectReturn: async (id: string) => (await axios.post(`/Item/returns/${id}/reject`)).data,

  listAdjustments: async (params: MovementListParams) =>
    (await axios.get<Paged<ProductAdjustment>>('/Item/adjustments', { params: clean(params) })).data,
  createAdjustment: async (payload: CreateAdjustmentPayload) =>
    (await axios.post<ProductAdjustment>('/Item/adjustments', payload)).data,
  applyAdjustment: async (id: string) => (await axios.post(`/Item/adjustments/${id}/apply`)).data,
  rejectAdjustment: async (id: string) => (await axios.post(`/Item/adjustments/${id}/reject`)).data,
};
