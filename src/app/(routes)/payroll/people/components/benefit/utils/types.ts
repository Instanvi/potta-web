export interface Benefit {
  uuid: string;
  name: string;
  type: string;
  rate: string;
  provider: string;
  description?: string;
  value?: string;
  cycle?: string;
  is_taxable?: boolean;
  tax_cap?: string;
  salary_cap?: string;
  max_amount?: string;
  expires_at?: string;
  role_based?: boolean;
  is_default?: boolean;
  status?: string;
}

export interface Deduction {
  id: string;
  motif: string;
  type: string;
  rate: string;
}

export interface BenefitPayload {
  benefits: string[];
  deductions: Deduction[];
}

export interface BenefitsResponse {
  data: Benefit[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: string[][];
  };
  links: {
    current: string;
  };
}