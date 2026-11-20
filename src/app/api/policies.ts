import { axios } from 'config/axios.config';

export interface PoliciesFilterParams {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
  branchId: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoliciesResponse {
  data: Policy[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export const getPolicies = async (
  params: PoliciesFilterParams
): Promise<PoliciesResponse> => {
  const { data } = await axios.get('/policies/all', params);
  return data;
};
