// Define the PTO policy payload type based on the API documentation
export interface PTOPolicyPayload {
  type: string;
  cycle_type: string;
  accrual_rate: number;
  total_entitled_days: number;
  start_date: string;
  end_date: string;
  status: string;
}

// PTO policy types
export const PTO_TYPES = {
  VACATION: 'VACATION',
  SICK_LEAVE: 'SICK_LEAVE',
  PERSONAL: 'PERSONAL',
  MATERNITY: 'MATERNITY',
  PATERNITY: 'PATERNITY'
};

// PTO cycle types
export const CYCLE_TYPES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY'
};

// PTO status types
export const STATUS_TYPES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING'
};

// Helper function to map policy name to type
export const getPolicyType = (name: string): string => {
  // Default to VACATION if no specific mapping
  if (name.toLowerCase().includes('sick')) return PTO_TYPES.SICK_LEAVE;
  if (name.toLowerCase().includes('vacation')) return PTO_TYPES.VACATION;
  if (name.toLowerCase().includes('personal')) return PTO_TYPES.PERSONAL;
  if (name.toLowerCase().includes('maternity')) return PTO_TYPES.MATERNITY;
  if (name.toLowerCase().includes('paternity')) return PTO_TYPES.PATERNITY;
  return PTO_TYPES.VACATION;
};

// Helper function to convert duration to total entitled days
export const convertDurationToDays = (duration: string, durationUnit: string): number => {
  const durationValue = parseInt(duration);
  
  if (durationUnit === 'Hours') {
    return durationValue / 8; // Assuming 8 hours per day
  } else if (durationUnit === 'Weeks') {
    return durationValue * 5; // Assuming 5 working days per week
  } else if (durationUnit === 'Months') {
    return durationValue * 22; // Assuming 22 working days per month
  }
  
  // If the unit is already in days, return as is
  return durationValue;
};