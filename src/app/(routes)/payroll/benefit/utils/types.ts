export type BenefitType = 'FINANCIAL' | 'SERVICE' | 'REDEEMABLE';
export type CycleType =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUALLY'
  | 'ONE_TIME'
  | 'NONE';

export interface BenefitPayload {
  name: string;
  description: string;
  type: BenefitType;
  componentType?: string; // BENEFIT_CATEGORY_ENUM value
  value: number;
  cycle?: CycleType;
  is_taxable?: boolean;
  tax_cap?: number;
  expires_at?: string;
  role_based?: boolean;
  eligible_roles?: string[];
  is_default?: boolean;
  rate?: number;
  salary_cap?: number;
  max_amount?: number;
  provider: string;

  // Additional DTO fields
  isPercentage?: boolean;
  percentageOfBase?: number;
  minValue?: number;
  maxValue?: number;
  minimumWageCompliant?: boolean;
  yearsOfServiceMin?: number;
  yearsOfServiceMax?: number;
  isNeverTaxable?: boolean;
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  type?: BenefitType;
  is_taxable?: boolean;
  is_default?: boolean;
  role_based?: boolean;
}
