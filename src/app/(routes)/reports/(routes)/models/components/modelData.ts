export const plData = [
  {
    label: 'Revenue',
    value: 65000,
    percent: 100,
    section: 'revenue',
    children: [
      { label: 'Product Sales', value: 50000, percent: 76.9 },
      { label: 'Service Income', value: 15000, percent: 23.1 },
    ],
  },
  {
    label: 'Cost of Goods Sold (COGS)',
    value: 20000,
    percent: 30.8,
    section: 'cogs',
    children: [
      { label: 'Materials', value: 12000, percent: 18.5 },
      { label: 'Labor', value: 8000, percent: 12.3 },
    ],
  },
  {
    label: 'Gross Profit',
    value: 45000,
    percent: 69.2,
    section: 'gross',
    highlight: true,
  },
  {
    label: 'Operating Expenses',
    value: 17500,
    percent: 26.9,
    section: 'opx',
    children: [
      { label: 'Salaries & Wages', value: 9000, percent: 13.8 },
      { label: 'Rent', value: 4000, percent: 6.2 },
      { label: 'Utilities', value: 2000, percent: 3.1 },
      { label: 'Marketing', value: 1500, percent: 2.3 },
      { label: 'Office Supplies', value: 1000, percent: 1.5 },
    ],
  },
  {
    label: 'Operating Profit',
    value: 27500,
    percent: 42.3,
    section: 'operating',
    highlight: true,
  },
  {
    label: 'Other Income',
    value: 500,
    percent: 0.8,
    section: 'other',
    children: [{ label: 'Interest Income', value: 500, percent: 0.8 }],
  },
  {
    label: 'Other Expenses',
    value: 700,
    percent: 1.1,
    section: 'other',
    children: [{ label: 'Interest Expense', value: 700, percent: 1.1 }],
  },
  {
    label: 'Net Profit',
    value: 27300,
    percent: 42,
    section: 'net',
    highlight: true,
  },
];

export const balanceSheetData = [
  { label: 'Assets', isHeader: true },
  { label: '  Cash', value: 15000 },
  { label: '  Accounts Receivable', value: 12000 },
  { label: '  Inventory', value: 8000 },
  { label: '  Property & Equipment', value: 30000 },
  { label: 'Total Assets', value: 65000, highlight: true },
  { label: 'Liabilities', isHeader: true },
  { label: '  Accounts Payable', value: 7000 },
  { label: '  Short-term Loans', value: 5000 },
  { label: '  Long-term Debt', value: 10000 },
  { label: 'Total Liabilities', value: 22000, highlight: true },
  { label: "Owner's Equity", isHeader: true },
  { label: '  Common Stock', value: 20000 },
  { label: '  Retained Earnings', value: 23000 },
  { label: 'Total Equity', value: 43000, highlight: true },
  { label: 'Total Liabilities & Equity', value: 65000, highlight: true },
];

export const cashFlowData = [
  { label: 'Operating Activities', isHeader: true },
  { label: '  Net Income', value: 27300 },
  { label: '  Depreciation', value: 2000 },
  { label: '  Change in Working Capital', value: -1500 },
  { label: 'Net Cash from Operating', value: 27800, highlight: true },
  { label: 'Investing Activities', isHeader: true },
  { label: '  Purchase of Equipment', value: -5000 },
  { label: 'Net Cash from Investing', value: -5000, highlight: true },
  { label: 'Financing Activities', isHeader: true },
  { label: '  Loan Proceeds', value: 3000 },
  { label: '  Loan Repayment', value: -2000 },
  { label: 'Net Cash from Financing', value: 1000, highlight: true },
  { label: 'Net Increase in Cash', value: 23800, highlight: true },
];

export const budgetActualsData = [
  { label: 'Revenue', budget: 60000, actual: 65000 },
  { label: 'COGS', budget: 18000, actual: 20000 },
  { label: 'Operating Expenses', budget: 16000, actual: 17500 },
  { label: 'Net Profit', budget: 12000, actual: 27300 },
];

export const financialRatiosData = [
  { label: 'Gross Margin', value: '69.2%' },
  { label: 'Net Margin', value: '42.0%' },
  { label: 'Current Ratio', value: '2.95' },
  { label: 'Quick Ratio', value: '2.13' },
  { label: 'Debt/Equity', value: '0.51' },
];

export const salesForecastData = [
  { period: 'Q1 2025', sales: 18000 },
  { period: 'Q2 2025', sales: 20000 },
  { period: 'Q3 2025', sales: 22000 },
  { period: 'Q4 2025', sales: 25000 },
];

export const breakEvenData = [
  { label: 'Fixed Costs', value: 10000 },
  { label: 'Variable Cost per Unit', value: 200 },
  { label: 'Selling Price per Unit', value: 500 },
  { label: 'Break-even Units', value: 34 },
  { label: 'Break-even Sales (FCFA)', value: 17000 },
];

export const scenarioAnalysisData = [
  { scenario: 'Base Case', revenue: 65000, profit: 27300 },
  { scenario: 'Optimistic', revenue: 75000, profit: 35000 },
  { scenario: 'Pessimistic', revenue: 55000, profit: 18000 },
];

export const plColumns = [
  { key: 'label', label: 'Description' },
  { key: 'value', label: 'Amount (FCFA)', align: 'right' as const },
  { key: 'percent', label: '% of Revenue', align: 'right' as const },
];
export const balanceSheetColumns = [
  { key: 'label', label: 'Description' },
  { key: 'value', label: 'Amount (FCFA)', align: 'right' as const },
];
export const cashFlowColumns = [
  { key: 'label', label: 'Description' },
  { key: 'value', label: 'Amount (FCFA)', align: 'right' as const },
];
export const budgetActualsColumns = [
  { key: 'label', label: 'Description' },
  { key: 'budget', label: 'Budget (FCFA)', align: 'right' as const },
  { key: 'actual', label: 'Actual (FCFA)', align: 'right' as const },
];
export const financialRatiosColumns = [
  { key: 'label', label: 'Ratio' },
  { key: 'value', label: 'Value', align: 'right' as const },
];
export const salesForecastColumns = [
  { key: 'period', label: 'Period' },
  { key: 'sales', label: 'Sales (FCFA)', align: 'right' as const },
];
export const breakEvenColumns = [
  { key: 'label', label: 'Description' },
  { key: 'value', label: 'Value', align: 'right' as const },
];
export const scenarioAnalysisColumns = [
  { key: 'scenario', label: 'Scenario' },
  { key: 'revenue', label: 'Revenue (FCFA)', align: 'right' as const },
  { key: 'profit', label: 'Net Profit (FCFA)', align: 'right' as const },
];
