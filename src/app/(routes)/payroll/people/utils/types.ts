// Person payload for creating/updating a person
export interface PersonPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  eligible_for_tips?: boolean;
  eligible_for_overtime?: boolean;
  base_pay?: number;
  compensation_schedule?: string;
  employment_type: string;
  start_date: string;
  end_date?: string | null;
  hourly_rate?: number;
  salary?: number;
  payScheduleId?: string;
  marital_status: string;
  tax_payer_number: string;
  national_identification_number: string;
  // Bank account fields - now included in main payload
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  currency?: string;
  account_type?: string;
  is_primary?: boolean;
  country?: string;
  verified?: boolean;
  roleName?: string;
  isActive: boolean;
  benefits?: string[];
  address: AddressPayload;
  profilePicture?: string;
}

// Address payload for a person
export interface AddressPayload {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

// Base information for a person
export interface BaseInfoPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  employmentType: string;
  employmentDate: string;
  maritalStatus: string;
  nationalId: string;
  roleName?: string;
  taxPayerNumber: string;
  employeeId?: string;
  jobTitle?: string;
}

// Bank account information for a person
export interface BankAccountPayload {
  person_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  currency: string;
  account_type: string;
  is_primary: boolean;
  country: string;
  verified: boolean;
  country_code?: string;
}

// Compensation information for a person
export interface CompensationPayload {
  personId: string;
  hourlyRate: number;
  salary: number;
  paymentFrequency: string;
  eligibleForTips: boolean;
  eligibleForOvertime: boolean;
  paid_time_off?: any[];
}

// Schedule information for a person
export interface SchedulePayload {
  personId: string;
  payScheduleId: string;
  payCycleName: string;
  firstPayDate: string;
  endPayDate: string;
  effectiveDate: string;
}

// Benefit information for a person
export interface BenefitPayload {
  personId: string;
  benefits: string[];
}

// Tax information for a person
export interface TaxInfoPayload {
  personId: string;
  taxInfo: any;
}

// Filter parameters for API calls
export interface FilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  isActive?: boolean;
  employmentType?: string;
}

export interface Employee {
  uuid: string;
  firstName: string;
  lastName: string;
  matricule: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  employment_type: string;
  marital_status: string;
  start_date: string;
  end_date: string | null;
  hourly_rate: string;
  salary: string | null;
  base_pay: string;
  compensation_schedule: string;
  bank_name: string;
  account_number: string;
  currency: string;
  is_active: boolean;
  profilePicture?: string;
  role_name?: string; // Added role_name field
  address: {
    city: string;
    state: string;
    address: string;
    country: string;
    latitude: number;
    longitude: number;
    postalCode: string;
  };
  benefits: Array<{
    uuid: string;
    name: string;
    description: string;
    type: string;
    value: string;
    cycle: string;
    is_taxable: boolean;
    status: string;
  }>;
  paid_time_off: Array<{
    uuid: string;
    type: string;
    cycle_type: string;
    accrual_rate: string;
    total_entitled_days: string;
    days_used: string;
    days_remaining: string;
    status: string;
  }>;
}

export interface Timesheet {
  uuid: string;
  employee?: { uuid: string; firstName?: string; lastName?: string };
  check_in_time?: string;
  check_out_time?: string;
  total_hours?: string;
  break_minutes?: number;
  status?: string;
  createdAt: string;
  [key: string]: any;
}
