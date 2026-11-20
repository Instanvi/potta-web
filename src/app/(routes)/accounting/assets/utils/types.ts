export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  status: string;
  acquisition_cost: number;
  location: string;
  description?: string;
  acquisition_date?: string;
  depreciation_method?: string;
  useful_life_years?: number;
  salvage_value?: number | undefined | '';
  serial_number?: number | string | '';
  createdAt: string;
  updatedAt: string;
}

export interface AssetResponse {
  data: Asset[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, string][];
    search?: string;
    searchBy?: string[];
  };
  links: {
    current: string;
  };
}

export interface AssetFilter {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}
