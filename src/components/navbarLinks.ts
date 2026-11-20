import { MenuItem } from "./custom-navbar";

export const menuStructure: MenuItem[] = [
  {
    title: 'Home',
    children: [
      { title: 'Dashboard', href: '/payroll/overview' },
      { title: 'Customer Dashboard', href: '/home/customer-dashboard' },
      { title: 'Supplier Dashboard', href: '/home/supplier-dashboard' },
      { title: 'Item Dashboard', href: '/home/item-dashboard' },
      { title: 'Financial Dashboard', href: '/expenses' },
      { title: 'My Workplace', href: '/home/my-workplace' },
    ],
  },
  {
    title: 'Quick action',
    children: [
      { title: 'Customers', href: '/pos/customers' },
      { title: 'Suppliers', href: '/pos/vendors' },
      { title: 'Items', href: '/pos/inventory' },
      { title: 'Bank Accounts', href: '/bank-accounts' },
      { title: 'Accounts', href: '/accounts' },
    ],
  },
  {
    title: 'Customers',
    children: [
      { title: 'Add Customer', href: '/customers/add-customer' },
      {
        title: 'List',
        children: [
          {
            title: 'List of Customers',
            href: '/customers/list/list-of-customers',
          },
          {
            title: 'List of Sales Reps',
            href: '/customers/list/list-of-sales-reps',
          },
        ],
      },
      {
        title: 'Transactions',
        children: [
          {
            title: 'Customer Quotes',
            href: '/customers/transactions/customer-quotes',
          },
          {
            title: 'Customer Sales Orders',
            href: '/customers/transactions/customer-sales-orders',
          },
          {
            title: 'Customer Tax Invoices',
            href: '/customers/transactions/customer-tax-invoices',
          },
          {
            title: 'Customer RCC Invoices',
            href: '/customers/transactions/customer-rcc-invoices',
          },
          {
            title: 'Customer Credit Notes',
            href: '/customers/transactions/customer-credit-notes',
          },
          {
            title: 'Customer Receipts',
            href: '/customers/transactions/customer-receipts',
          },
          {
            title: 'Allocate Receipts',
            href: '/customers/transactions/allocate-receipts',
          },
        ],
      },
      {
        title: 'Reports',
        children: [
          {
            title: 'Customer Statement Run',
            href: '/customers/reports/customer-statement-run',
          },
          {
            title: 'List of Customers',
            href: '/customers/reports/list-of-customers',
          },
          {
            title: 'Sales by Customers',
            href: '/customers/reports/sales-by-customers',
          },
          {
            title: 'Sales by Sales Rep',
            href: '/customers/reports/sales-by-sales-rep',
          },
          {
            title: 'Customer Balances',
            href: '/customers/reports/customer-balances',
          },
          {
            title: 'Customer Statements',
            href: '/customers/reports/customer-statements',
          },
          {
            title: 'Customer Transactions',
            href: '/customers/reports/customer-transactions',
          },
          {
            title: 'Customer Quotes',
            href: '/customers/reports/customer-quotes',
          },
          {
            title: 'Customer Quotes by Customer',
            href: '/customers/reports/customer-quotes-by-customer',
          },
          {
            title: 'Customer Sales Orders',
            href: '/customers/reports/customer-sales-orders',
          },
          {
            title: 'Customer Sales Order by Customer',
            href: '/customers/reports/customer-sales-order-by-customer',
          },
          {
            title: 'Customer Invoices',
            href: '/customers/reports/customer-invoices',
          },
          {
            title: 'Customer Unallocated Receipt',
            href: '/customers/reports/customer-unallocated-receipt',
          },
          {
            title: 'Customer Communication Report',
            href: '/customers/reports/customer-communication-report',
          },
        ],
      },
      { title: 'Special', href: '/customers/special' },
    ],
  },
  // {
  //   title: 'Accountant Area',
  //   children: [
  //     {
  //       title: 'Send a Note to my Accountant',
  //       href: '/accountant-area/send-a-note-to-my-accountant',
  //     },
  //     {
  //       title: 'Process Journal Entries',
  //       href: '/accountant-area/process-journal-entries',
  //     },
  //     {
  //       title: 'Recurring Journal Entries',
  //       href: '/accountant-area/recurring-journal-entries',
  //     },
  //     {
  //       title: 'VAT',
  //       children: [
  //         {
  //           title: 'VAT Returns and Reports',
  //           href: '/accountant-area/vat/vat-returns-and-reports',
  //         },
  //         {
  //           title: 'VAT Adjustments',
  //           href: '/accountant-area/vat/vat-adjustments',
  //         },
  //         {
  //           title: 'VAT Payments and Returns',
  //           href: '/accountant-area/vat/vat-payments-and-returns',
  //         },
  //         {
  //           title: 'DRC VAT Allocations',
  //           href: '/accountant-area/vat/drc-vat-allocations',
  //         },
  //         {
  //           title: 'DRC VAT Statements',
  //           href: '/accountant-area/vat/drc-vat-statements',
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Reports',
  //       children: [
  //         {
  //           title: 'Management Reports',
  //           children: [
  //             {
  //               title: 'Profit and Loss',
  //               href: '/accountant-area/reports/management-reports/profit-and-loss',
  //             },
  //             {
  //               title: 'Balance Sheet',
  //               href: '/accountant-area/reports/management-reports/balance-sheet',
  //             },
  //             {
  //               title: 'Trial Balance',
  //               href: '/accountant-area/reports/management-reports/trial-balance',
  //             },
  //             {
  //               title: 'Budget Report',
  //               href: '/accountant-area/reports/management-reports/budget-report',
  //             },
  //           ],
  //         },
  //         {
  //           title: 'Transaction Reports',
  //           children: [
  //             {
  //               title: 'Journal Entries Reports',
  //               href: '/accountant-area/reports/transaction-reports/journal-entries-reports',
  //             },
  //           ],
  //         },
  //         {
  //           title: 'Audit Reports',
  //           children: [
  //             {
  //               title: 'Opening Balances and VAT Adjustments',
  //               href: '/accountant-area/reports/audit-reports/opening-balances-and-vat-adjustments',
  //             },
  //             {
  //               title: 'Audit Trail',
  //               href: '/accountant-area/reports/audit-reports/audit-trail',
  //             },
  //             {
  //               title: 'System Audit Trail',
  //               href: '/accountant-area/reports/audit-reports/system-audit-trail',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Trial Balance Report',
  //       href: '/accountant-area/trial-balance-report',
  //     },
  //   ],
  // },
  {
    title: 'Suppliers',
    children: [
      { title: 'Add Supplier', href: '/pos/vendors' },
      {
        title: 'List',
        children: [
          {
            title: 'List of Customers',
            href: '/pos/customers',
          },
          {
            title: 'List of Sales Reps',
            href: '/pos/sales',
          },
        ],
      },
      {
        title: 'Transactions',
        children: [
          {
            title: 'Supplier Purchase Orders',
            href: '/suppliers/transactions/supplier-purchase-orders',
          },
          {
            title: 'Supplier Invoices',
            href: '/suppliers/transactions/supplier-invoices',
          },
          {
            title: 'Supplier Returns',
            href: '/suppliers/transactions/supplier-returns',
          },
          {
            title: 'Supplier Payments',
            href: '/suppliers/transactions/supplier-payments',
          },
          {
            title: 'Supplier Batch Payments',
            href: '/suppliers/transactions/supplier-batch-payments',
          },
          {
            title: 'Allocate Payments',
            href: '/suppliers/transactions/allocate-payments',
          },
          {
            title: 'Supplier Adjustments',
            href: '/suppliers/transactions/supplier-adjustments',
          },
        ],
      },
      {
        title: 'Reports',
        children: [
          {
            title: 'List of Suppliers',
            href: '/suppliers/reports/list-of-suppliers',
          },
          {
            title: 'Purchase by Supplier',
            href: '/suppliers/reports/purchase-by-supplier',
          },
          {
            title: 'Supplier Balances - Outstanding Days',
            href: '/suppliers/reports/supplier-balances-outstanding-days',
          },
          {
            title: 'Supplier Transactions',
            href: '/suppliers/reports/supplier-transactions',
          },
          {
            title: 'Supplier Statement',
            href: '/suppliers/reports/supplier-statement',
          },
          {
            title: 'Supplier Purchase Orders',
            href: '/suppliers/reports/supplier-purchase-orders',
          },
          {
            title: 'List of Purchase Orders by Suppliers',
            href: '/suppliers/reports/list-of-purchase-orders-by-suppliers',
          },
          {
            title: 'Supplier Invoices',
            href: '/suppliers/reports/supplier-invoices',
          },
          {
            title: 'Supplier Unallocated Payments',
            href: '/suppliers/reports/supplier-unallocated-payments',
          },
          {
            title: 'Email Sent to Suppliers',
            href: '/suppliers/reports/email-sent-to-suppliers',
          },
        ],
      },
      { title: 'Special', href: '/suppliers/special' },
    ],
  },
  {
    title: 'Items',
    children: [
      { title: 'Add Items', href: '/pos/inventory' },
      { title: 'Lists', href: '/pos/inventory' },
      { title: 'Transactions', href: '/payments/transactions' },
      { title: 'Special', href: '/special' },
      { title: 'Reports', href: '/reports' },
    ],
  },
  {
    title: 'Payroll',
    children: [
      { title: 'Employees', href: '/payroll/people' },
      { title: 'Timesheets', href: '/payroll/timesheet' },
      { title: 'Deductions', href: '/payroll/deductions' },
      { title: 'Benefits', href: '/payroll/benefit' },
      { title: 'PTO', href: '/payroll/pto' },
      {
        title: 'Reports',
        children: [
          { title: 'Payslip', href: '/payroll/reports/payslip' },
          {
            title: 'List of Assets',
            href: '/payroll/reports/list-of-assets',
          },
          {
            title: 'Asset Categories',
            href: '/payroll/reports/asset-categories',
          },
          {
            title: 'Asset Locations',
            href: '/payroll/reports/asset-locations',
          },
          { title: 'Asset Reports', href: '/payroll/reports/asset-reports' },
        ],
      },
    ],
  },
  {
    title: 'Banking',
    children: [
      {
        title: 'Add Bank or Credit Card',
        href: '/bank-accounts',
      },
      { title: 'Add Bank Rep', href: '/banking/add-bank-rep' },
      {
        title: 'List',
        children: [
          {
            title: 'List of Bank & Cards',
            href: '/banking/list/list-of-bank-and-cards',
          },
          {
            title: 'Bank & Credit Card Categories',
            href: '/banking/list/bank-and-credit-card-categories',
          },
          {
            title: 'Quick Entry Rules',
            href: '/banking/list/quick-entry-rules',
          },
          {
            title: 'Bank Statement Mapping',
            href: '/banking/list/bank-statement-mapping',
          },
        ],
      },
      {
        title: 'Transactions',
        children: [
          { title: 'Banking', href: '/banking/transactions/banking' },
          {
            title: 'Reconcile Banks & Credit Cards',
            href: '/banking/transactions/reconcile-banks-and-credit-cards',
          },
          {
            title: 'Manage Bank Feeds',
            href: '/banking/transactions/manage-bank-feeds',
          },
        ],
      },
      {
        title: 'Reports',
        children: [
          {
            title: 'List of Banks & Credit Cards',
            href: '/banking/reports/list-of-banks-and-credit-cards',
          },
          {
            title: 'Bank and Card Transactions',
            href: '/banking/reports/bank-and-card-transactions',
          },
          {
            title: 'Cash Movements',
            href: '/banking/reports/cash-movements',
          },
          { title: 'Cashflow', href: '/banking/reports/cashflow' },
          {
            title: 'Bank Feeds Audit Trail',
            href: '/banking/reports/bank-feeds-audit-trail',
          },
        ],
      },
      {
        title: 'Special',
        children: [
          {
            title: 'Adjust Bank and Credit Card Opening Balances',
            href: '/banking/special/adjust-bank-and-credit-card-opening-balances',
          },
        ],
      },
    ],
  },
  {
    title: 'Accounts',
    children: [
      { title: 'Add Account', href: '/accounts' },
      {
        title: 'List',
        children: [
          {
            title: 'List of Accounts',
            href: '/accounts/list/list-of-accounts',
          },
          { title: 'Item Accounts', href: '/accounts/list/item-accounts' },
        ],
      },
      {
        title: 'Account Reporting Groups',
        href: '/accounts/account-reporting-groups',
      },
      {
        title: 'Adjust Opening Hands',
        href: '/accounts/adjust-opening-hands',
      },
      {
        title: 'Reports',
        children: [
          {
            title: 'Account Listing',
            href: '/accounts/reports/account-listing',
          },
          {
            title: 'Account Transactions',
            href: '/accounts/reports/account-transactions',
          },
        ],
      },
    ],
  },

  {
    title: 'Company',
    children: [
      {
        title: 'Change Company Setting',
        children: [
          {
            title: 'Change Password',
            href: '/company/change-company-setting/change-password',
          },
          {
            title: 'My Account',
            href: '/company/change-company-setting/my-account',
          },
          { title: 'Logout', href: '/company/change-company-setting/logout' },
        ],
      },
      {
        title: 'Company Notes and Attachments',
        href: '/company/company-notes-and-attachments',
      },
      {
        title: 'Assets',
        children: [
          { title: 'Add an Asset', href: '/company/assets/add-an-asset' },
          { title: 'List of Assets', href: '/company/assets/list-of-assets' },
          {
            title: 'Asset Categories',
            href: '/company/assets/asset-categories',
          },
          { title: 'Asset Location', href: '/company/assets/asset-location' },
          { title: 'Asset Reports', href: '/company/assets/asset-reports' },
        ],
      },
      {
        title: 'Budgets',
        children: [
          { title: 'Add Budget', href: '/company/budgets/add-budget' },
          {
            title: 'List of Budgets',
            href: '/company/budgets/list-of-budgets',
          },
          {
            title: 'Budgets Reports',
            href: '/company/budgets/budgets-reports',
          },
        ],
      },
      { title: 'Analysis Codes', href: '/company/analysis-codes' },
      { title: 'Import Data', href: '/company/import-data' },
      { title: 'Export Data', href: '/company/export-data' },
      { title: 'Opening Balances', href: '/company/opening-balances' },
    ],
  },
  {
    title: 'Reports',
    children: [
      {
        title: 'Accounting Intelligence Reports',
        href: '/reports/accounting-intelligence-reports',
      },
      { title: 'Customers', href: '/reports/customers' },
      { title: 'Suppliers', href: '/reports/suppliers' },
      { title: 'Items', href: '/reports/items' },
      { title: 'Sales and Purchases', href: '/reports/sales-and-purchases' },
      {
        title: 'Banks & Credit Cards',
        href: '/reports/banks-and-credit-cards',
      },
      { title: 'VAT', href: '/reports/vat' },
      { title: 'Accounts', href: '/reports/accounts' },
      {
        title: 'Financial Statements',
        href: '/reports/financial-statements',
      },
      { title: 'Asset Reports', href: '/reports/asset-reports' },
      { title: 'Budget Reports', href: '/reports/budget-reports' },
      { title: 'Others', href: '/reports/others' },
      { title: 'Accountant Reports', href: '/reports/accountant-reports' },
    ],
  },
];