export const FORM_STEPS = {
  EMPLOYEE_BASE_INFO: 'ebi',
  EMPLOYEE_LOCATION: 'el',
  BANK_ACCOUNT: 'ba',
  COMPENSATION: 'c',
  PAY_SCHEDULE: 'ps',
  BENEFITS: 'bad',
  EMPLOYEE_TAX_INFO: 'eti',
} as const;

export const FORM_STEP_LABELS = {
  [FORM_STEPS.EMPLOYEE_BASE_INFO]: 'Employee Base Information',
  [FORM_STEPS.EMPLOYEE_LOCATION]: 'Employee Location',
  [FORM_STEPS.BANK_ACCOUNT]: 'Bank Account',
  [FORM_STEPS.COMPENSATION]: 'Compensation',
  [FORM_STEPS.PAY_SCHEDULE]: 'PayCycle',
  [FORM_STEPS.BENEFITS]: 'Benefits',
  [FORM_STEPS.EMPLOYEE_TAX_INFO]: 'Employee Tax Information',
} as const;

export const FORM_STEP_ORDER = [
  FORM_STEPS.EMPLOYEE_BASE_INFO,
  FORM_STEPS.EMPLOYEE_LOCATION,
  FORM_STEPS.BANK_ACCOUNT,
  FORM_STEPS.COMPENSATION,
  FORM_STEPS.PAY_SCHEDULE,
  FORM_STEPS.BENEFITS,
  FORM_STEPS.EMPLOYEE_TAX_INFO,
];

export const STORAGE_KEYS = {
  PERSON_ID: 'potta_personId',
  ACTIVE_STEP: 'potta_activeStep',
  BASE_INFO: 'potta_baseInfo',
  ADDRESS: 'potta_address',
  BANK_ACCOUNT: 'potta_bankAccount',
  COMPENSATION: 'potta_compensation',
  SCHEDULE: 'potta_schedule',
  BENEFIT: 'potta_benefit',
  TAX_INFO: 'potta_taxInfo',
} as const;

export const STEPS_WITHOUT_BUTTONS = [
  FORM_STEPS.COMPENSATION,
  FORM_STEPS.PAY_SCHEDULE,
  FORM_STEPS.BENEFITS,
];

export const DEFAULT_PAGE_SIZE = 10;
