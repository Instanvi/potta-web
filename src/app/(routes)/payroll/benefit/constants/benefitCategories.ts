// Benefit Category Enum - matches backend expectations
export enum BENEFIT_CATEGORY_ENUM {
  BASE_SALARY = 'BASE_SALARY',
  SENIORITY_BONUS = 'SENIORITY_BONUS',
  RESPONSIBILITY_ALLOWANCE = 'RESPONSIBILITY_ALLOWANCE',
  DIRT_ALLOWANCE = 'DIRT_ALLOWANCE',
  MILK_ALLOWANCE = 'MILK_ALLOWANCE',
  ENCOURAGEMENT_BONUS = 'ENCOURAGEMENT_BONUS',
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  HOUSING_ALLOWANCE = 'HOUSING_ALLOWANCE',
  TRANSPORT_ALLOWANCE = 'TRANSPORT_ALLOWANCE',
  FAMILY_ALLOWANCE = 'FAMILY_ALLOWANCE',
  RISK_ALLOWANCE = 'RISK_ALLOWANCE',
  PTO = 'PTO',
  SICK_LEAVE_PAY = 'SICK_LEAVE_PAY',
  OVERTIME_PAY = 'OVERTIME_PAY',
  PERFORMANCE_BONUS = 'PERFORMANCE_BONUS',
  SALES_COMMISSION = 'SALES_COMMISSION',
  HARDSHIP_ALLOWANCE = 'HARDSHIP_ALLOWANCE',
  THIRTEENTH_MONTH = 'THIRTEENTH_MONTH',
  PIT = 'PIT',
  CNPS_EMPLOYEE = 'CNPS_EMPLOYEE',
  FNH_EMPLOYEE = 'FNH_EMPLOYEE',
  LDT = 'LDT',
  AUDIOVISUAL_TAX = 'AUDIOVISUAL_TAX',
  CNPS_EMPLOYER = 'CNPS_EMPLOYER',
  FNH_EMPLOYER = 'FNH_EMPLOYER',
  FNE = 'FNE',
  PAYROLL_TAX = 'PAYROLL_TAX',
}

export interface BenefitCategoryConfig {
  rateType: 'Percentage' | 'Flat Rate';
  cycle: string;
  isTaxable: boolean;
  minPercentage?: number;
  maxPercentage?: number;
  minFlatRate?: number;
  maxFlatRate?: number;
  helpText: string;
  category: string;
  enumValue: BENEFIT_CATEGORY_ENUM;
  isDeduction?: boolean;
  isMandatory?: boolean;
}

export const BENEFIT_CATEGORIES: Record<string, BenefitCategoryConfig> = {
  'Base Salary': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: true,
    minFlatRate: 41875, // SMIG 2024
    maxFlatRate: 10000000,
    helpText:
      'Fixed monthly wage agreed between employer & employee. Cannot be lower than SMIG (XAF 41,875 as of 2024).',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.BASE_SALARY,
    isMandatory: true,
  },
  'Seniority Bonus': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 2,
    maxPercentage: 8,
    helpText:
      'Reward for loyalty based on years of service: 2-5 years (2%), 6-10 years (3%), 11-15 years (5%), 16-20 years (8%) of base salary.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.SENIORITY_BONUS,
  },
  'Responsibility Allowance': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 5,
    maxPercentage: 20,
    helpText:
      'Given to employees holding managerial or leadership roles. 5% - 20% of base salary depending on job level.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.RESPONSIBILITY_ALLOWANCE,
  },
  'Dirt Allowance': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: true,
    minFlatRate: 5000,
    maxFlatRate: 25000,
    helpText:
      'Paid to employees working in dirty or physically demanding environments. XAF 5,000 - 25,000 per month.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.DIRT_ALLOWANCE,
  },
  'Milk Allowance': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: false,
    minFlatRate: 5000,
    maxFlatRate: 20000,
    helpText:
      'Paid to workers exposed to dust, chemicals, or hazardous materials. XAF 5,000 - 20,000 per month. Not taxable (health benefit).',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.MILK_ALLOWANCE,
  },
  'Encouragement Bonus': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 5,
    maxPercentage: 50,
    helpText:
      'Performance-based bonus for motivation. 5% - 50% of base salary depending on performance.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.ENCOURAGEMENT_BONUS,
  },
  'Meal Allowance': {
    rateType: 'Flat Rate',
    cycle: 'DAILY',
    isTaxable: false,
    minFlatRate: 1000,
    maxFlatRate: 2500,
    helpText:
      'Given to employees working long shifts or fieldwork. XAF 1,000 - 2,500 per working day. Not taxable (benefit).',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.MEAL_ALLOWANCE,
  },
  'Housing Allowance': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 15,
    maxPercentage: 30,
    helpText:
      'Paid if employer does not provide housing. 15% - 30% of base salary. Taxable.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.HOUSING_ALLOWANCE,
  },
  'Transport Allowance': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: false,
    minFlatRate: 20000,
    maxFlatRate: 50000,
    helpText:
      'Covers employee commuting expenses. XAF 20,000 - 50,000 per month. Not taxable.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.TRANSPORT_ALLOWANCE,
  },
  'Family Allowance': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: false,
    minFlatRate: 2800,
    maxFlatRate: 2800,
    helpText:
      'Paid to employees with dependent children. XAF 2,800 per child per month (managed by CNPS).',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.FAMILY_ALLOWANCE,
  },
  'Risk Allowance': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 5,
    maxPercentage: 30,
    helpText:
      'Paid to employees working in dangerous conditions. 5% - 30% of base salary. Applicable to healthcare, security, mining, construction.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.RISK_ALLOWANCE,
  },
  'Paid Time Off': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 100,
    maxPercentage: 100,
    helpText:
      'Annual leave: 1.5 days per month (18 days/year) at 100% salary. Maternity: 14 weeks, Paternity: 10 days.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.PTO,
  },
  'Sick Leave Pay': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 50,
    maxPercentage: 100,
    helpText:
      'Less than 1 year: 50% (3 months), 1-5 years: 75% (6 months), More than 5 years: 100% (12 months).',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.SICK_LEAVE_PAY,
  },
  'Overtime Pay': {
    rateType: 'Percentage',
    cycle: 'DAILY',
    isTaxable: true,
    minPercentage: 25,
    maxPercentage: 100,
    helpText:
      'Weekdays: +25%, Saturdays: +50%, Sundays & Public Holidays: +100% per hour beyond 40 hours/week.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.OVERTIME_PAY,
  },
  'Performance Bonus': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 5,
    maxPercentage: 50,
    helpText:
      'Based on individual or team performance. 5% - 50% of base salary. No fixed rate - varies by company.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.PERFORMANCE_BONUS,
  },
  'Sales Commission': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 1,
    maxPercentage: 20,
    helpText:
      'Paid to sales & marketing employees. Usually a percentage of sales revenue.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.SALES_COMMISSION,
  },
  'Hardship Allowance': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: true,
    minPercentage: 5,
    maxPercentage: 25,
    helpText:
      'Paid for working in remote or harsh environments. 5% - 25% of base salary.',
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.HARDSHIP_ALLOWANCE,
  },
  '13th Month Salary': {
    rateType: 'Percentage',
    cycle: 'ANNUALLY',
    isTaxable: true,
    minPercentage: 100,
    maxPercentage: 100,
    helpText:
      "Not mandatory but common practice. Equal to one month's base salary. Usually paid at year end.",
    category: 'Earnings',
    enumValue: BENEFIT_CATEGORY_ENUM.THIRTEENTH_MONTH,
  },
  'Personal Income Tax': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 0,
    maxPercentage: 35,
    helpText:
      'Progressive tax: 0-62k (0%), 62k-150k (10%), 150k-500k (15%), 500k-1.5M (25%), 1.5M+ (35%).',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.PIT,
    isDeduction: true,
    isMandatory: true,
  },
  'CNPS Employee': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 4.2,
    maxPercentage: 4.2,
    helpText: 'Retirement & Disability (CNPS Pension). 4.2% of gross salary.',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.CNPS_EMPLOYEE,
    isDeduction: true,
    isMandatory: true,
  },
  'FNH Employee': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 1,
    maxPercentage: 1,
    helpText:
      "National Housing Fund. 1% deduction from employee's gross salary.",
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.FNH_EMPLOYEE,
    isDeduction: true,
    isMandatory: true,
  },
  'Local Development Tax': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: false,
    minFlatRate: 250,
    maxFlatRate: 2500,
    helpText:
      'Local tax for municipal infrastructure. 62k-75k (250), 75k-100k (500), 100k-125k (750), 125k-150k (1000), 500k+ (2500).',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.LDT,
    isDeduction: true,
    isMandatory: true,
  },
  'Audiovisual Tax': {
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    isTaxable: false,
    minFlatRate: 0,
    maxFlatRate: 13000,
    helpText:
      'Applies to all salaried employees. 0-50k (0), 50k-100k (750), 100k-200k (1950), 200k-300k (3250), 300k-400k (4550), 400k-500k (5850), 500k-600k (7150), 600k-700k (8450), 700k-800k (9750), 800k-900k (11050), 900k-1M (12350), 1M+ (13000).',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.AUDIOVISUAL_TAX,
    isDeduction: true,
    isMandatory: true,
  },
  'CNPS Employer': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 4.2,
    maxPercentage: 7,
    helpText:
      'Retirement & Disability (4.2%), Family Allowance (7%), Work Injury (1.75%-5% based on risk).',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.CNPS_EMPLOYER,
    isDeduction: true,
    isMandatory: true,
  },
  'FNH Employer': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 1.5,
    maxPercentage: 1.5,
    helpText: 'National Housing Fund. 1.5% contribution from employer.',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.FNH_EMPLOYER,
    isDeduction: true,
    isMandatory: true,
  },
  FNE: {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 1,
    maxPercentage: 1,
    helpText:
      'National Employment Fund. 1% contribution from employer (no employee share).',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.FNE,
    isDeduction: true,
    isMandatory: true,
  },
  'Payroll Tax': {
    rateType: 'Percentage',
    cycle: 'MONTHLY',
    isTaxable: false,
    minPercentage: 2.5,
    maxPercentage: 2.5,
    helpText:
      'Taxe sur les Salaires. 2.5% of total gross salary. Paid only by employers.',
    category: 'Deductions',
    enumValue: BENEFIT_CATEGORY_ENUM.PAYROLL_TAX,
    isDeduction: true,
    isMandatory: true,
  },
};

export const BENEFIT_TYPE_OPTIONS = [
  { label: 'Financial', value: 'Financial' },
  { label: 'Service', value: 'Service' },
  { label: 'Redeemable', value: 'Redeemable' },
];

// Separate options for earnings and deductions
export const EARNINGS_CATEGORY_OPTIONS = Object.entries(BENEFIT_CATEGORIES)
  .filter(([_, config]) => config.category === 'Earnings')
  .map(([category, config]) => ({
    label: category,
    value: category,
    enumValue: config.enumValue,
    isDeduction: false,
  }));

export const DEDUCTIONS_CATEGORY_OPTIONS = Object.entries(BENEFIT_CATEGORIES)
  .filter(([_, config]) => config.category === 'Deductions')
  .map(([category, config]) => ({
    label: category,
    value: category,
    enumValue: config.enumValue,
    isDeduction: true,
  }));

export const CATEGORY_OPTIONS = Object.keys(BENEFIT_CATEGORIES).map(
  (category) => ({
    label: category,
    value: category,
    enumValue: BENEFIT_CATEGORIES[category].enumValue,
    isDeduction: BENEFIT_CATEGORIES[category].isDeduction || false,
  })
);

export const CYCLE_OPTIONS = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Annually', value: 'ANNUALLY' },
  { label: 'One Time', value: 'ONE_TIME' },
  { label: 'None', value: 'NONE' },
];

export const SALARY_CAP_OPTIONS = [
  { label: '100,000', value: '100000' },
  { label: '200,000', value: '200000' },
  { label: '300,000', value: '300000' },
  { label: '500,000', value: '500000' },
  { label: 'Custom', value: 'Custom' },
];

export const DEFAULT_LIMITS = {
  minPercentage: 0,
  maxPercentage: 100,
  minFlatRate: 0,
  maxFlatRate: 1000000,
};

// Helper function to get category config by enum value
export const getCategoryConfigByEnum = (enumValue: BENEFIT_CATEGORY_ENUM) => {
  return Object.values(BENEFIT_CATEGORIES).find(
    (config) => config.enumValue === enumValue
  );
};

// Helper function to get category name by enum value
export const getCategoryNameByEnum = (enumValue: BENEFIT_CATEGORY_ENUM) => {
  const config = getCategoryConfigByEnum(enumValue);
  return config
    ? Object.keys(BENEFIT_CATEGORIES).find(
        (key) => BENEFIT_CATEGORIES[key].enumValue === enumValue
      )
    : '';
};
