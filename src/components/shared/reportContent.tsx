'use client';
import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Receipt,
  Package,
  Calculator,
  Briefcase,
  Eye,
  Download,
  Clock,
  Search,
  X,
  ChevronRight,
  ExternalLink,
  Printer,
  Calendar,
  BarChart4,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import Button from '@potta/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { ScrollShadow } from '@nextui-org/react';

import Slider from '@potta/components/slideover';
import PaymentSummaryReport from '@potta/app/(routes)/reports/components/disbursementReports/paymentSummaryReport';
import BudgetUtilizationReport from '@potta/app/(routes)/reports/components/disbursementReports/budgetUtilizationReport';
import RootLayout from '@potta/app/(routes)/layout';

// Define TypeScript interfaces for our data structures
interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategoryId;
  dataType?: 'payment' | 'budget'; // Added to link reports to data types
}

type ReportCategoryId =
  | 'frequent'
  | 'all'
  | 'financial'
  | 'collection'
  | 'customer'
  | 'disbursement'
  | 'expense'
  | 'inventory'
  | 'tax'
  | 'vendor';

interface ReportCategory {
  id: ReportCategoryId;
  label: string;
  icon: React.ReactNode;
  folderName?: string;
}

// Type safe report data structure
interface ReportDataType {
  collection: Report[];
  customer: Report[];
  disbursement: Report[];
  expense: Report[];
  financial: Report[];
  inventory: Report[];
  tax: Report[];
  vendor: Report[];
  [key: string]: Report[]; // Index signature to allow string indexing
}

// Sample data types
interface ReportPeriod {
  startDate: string;
  endDate: string;
}

interface Payment {
  paymentId: string;
  payee: string;
  paymentDate: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: string;
  invoiceId: string;
  disbursementType: string;
}

interface PaymentKPIs {
  totalPaymentsMade: number;
  numberOfPayments: number;
  mostCommonPaymentMethod: string;
  largestPayment: number;
  outstandingPayments: number;
}

interface Budget {
  budgetId: string;
  budgetName: string;
  allocatedBudget: number;
  amountSpent: number;
  remainingBudget: number;
  utilizationPercentage: number;
  startDate: string;
  endDate: string;
  department: string;
}

interface BudgetUtilizationKPIs {
  totalBudgetAllocated: number;
  totalAmountSpent: number;
  overallUtilizationRate: number;
  departmentWithHighestUtilization: string;
  departmentWithLowestUtilization: string;
}

interface ReportData {
  reportPeriod: ReportPeriod;
  payments: Payment[];
  paymentKpis: PaymentKPIs;
  budgets: Budget[];
  budgetKpis: BudgetUtilizationKPIs;
}

// Sample data from the backend
const sampleData: ReportData = {
  reportPeriod: {
    startDate: '2025-03-01',
    endDate: '2025-03-31',
  },
  payments: [
    {
      paymentId: 'PAY001',
      payee: 'Vendor A',
      paymentDate: '2025-03-15',
      paymentMethod: 'Bank Transfer',
      paymentAmount: 5000,
      paymentStatus: 'completed',
      invoiceId: 'INV001',
      disbursementType: 'Vendor Payment',
    },
    {
      paymentId: 'PAY002',
      payee: 'Vendor B',
      paymentDate: '2025-03-10',
      paymentMethod: 'Credit Card',
      paymentAmount: 3500,
      paymentStatus: 'completed',
      invoiceId: 'INV002',
      disbursementType: 'Vendor Payment',
    },
    {
      paymentId: 'PAY003',
      payee: 'Contractor C',
      paymentDate: '2025-03-20',
      paymentMethod: 'Bank Transfer',
      paymentAmount: 7500,
      paymentStatus: 'pending',
      invoiceId: 'INV003',
      disbursementType: 'Service Payment',
    },
    {
      paymentId: 'PAY004',
      payee: 'Supplier D',
      paymentDate: '2025-03-05',
      paymentMethod: 'Check',
      paymentAmount: 2000,
      paymentStatus: 'completed',
      invoiceId: 'INV004',
      disbursementType: 'Inventory Payment',
    },
    {
      paymentId: 'PAY005',
      payee: 'Vendor E',
      paymentDate: '2025-03-25',
      paymentMethod: 'Bank Transfer',
      paymentAmount: 9000,
      paymentStatus: 'completed',
      invoiceId: 'INV005',
      disbursementType: 'Vendor Payment',
    },
  ],
  paymentKpis: {
    totalPaymentsMade: 50000,
    numberOfPayments: 25,
    mostCommonPaymentMethod: 'Bank Transfer',
    largestPayment: 10000,
    outstandingPayments: 3,
  },
  budgets: [
    {
      budgetId: 'BUD001',
      budgetName: 'Marketing Q1',
      allocatedBudget: 100000,
      amountSpent: 75000,
      remainingBudget: 25000,
      utilizationPercentage: 75,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      department: 'Marketing',
    },
    {
      budgetId: 'BUD002',
      budgetName: 'IT Infrastructure',
      allocatedBudget: 150000,
      amountSpent: 85000,
      remainingBudget: 65000,
      utilizationPercentage: 57,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      department: 'IT',
    },
    {
      budgetId: 'BUD003',
      budgetName: 'Sales Q1',
      allocatedBudget: 120000,
      amountSpent: 105000,
      remainingBudget: 15000,
      utilizationPercentage: 88,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      department: 'Sales',
    },
    {
      budgetId: 'BUD004',
      budgetName: 'R&D Projects',
      allocatedBudget: 80000,
      amountSpent: 45000,
      remainingBudget: 35000,
      utilizationPercentage: 56,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      department: 'R&D',
    },
    {
      budgetId: 'BUD005',
      budgetName: 'HR Training',
      allocatedBudget: 50000,
      amountSpent: 40000,
      remainingBudget: 10000,
      utilizationPercentage: 80,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      department: 'HR',
    },
  ],
  budgetKpis: {
    totalBudgetAllocated: 500000,
    totalAmountSpent: 350000,
    overallUtilizationRate: 70,
    departmentWithHighestUtilization: 'Sales',
    departmentWithLowestUtilization: 'IT',
  },
};

// Define report categories
const reportCategories: ReportCategory[] = [
  {
    id: 'frequent',
    label: 'Frequent Reports',
    icon: <Clock className="h-4 w-4 mr-2" />,
  },
  {
    id: 'all',
    label: 'All Reports',
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  {
    id: 'financial',
    label: 'Financial Reports',
    icon: <DollarSign className="h-4 w-4 mr-2" />,
    folderName: 'financialReports',
  },
  {
    id: 'collection',
    label: 'Collection Reports',
    icon: <CreditCard className="h-4 w-4 mr-2" />,
    folderName: 'collectioReports', // Match the folder name exactly
  },
  {
    id: 'customer',
    label: 'Customer Reports',
    icon: <Users className="h-4 w-4 mr-2" />,
    folderName: 'customerReports',
  },
  {
    id: 'disbursement',
    label: 'Disbursement Reports',
    icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    folderName: 'disbursementReports',
  },
  {
    id: 'expense',
    label: 'Expense Reports',
    icon: <Receipt className="h-4 w-4 mr-2" />,
    folderName: 'expenseReports',
  },
  {
    id: 'inventory',
    label: 'Inventory Reports',
    icon: <Package className="h-4 w-4 mr-2" />,
    folderName: 'inventoryReports',
  },
  {
    id: 'tax',
    label: 'Tax Reports',
    icon: <Calculator className="h-4 w-4 mr-2" />,
    folderName: 'TaxReports',
  },
  {
    id: 'vendor',
    label: 'Vendor Reports',
    icon: <Briefcase className="h-4 w-4 mr-2" />,
    folderName: 'vendorReports',
  },
];

// Updated report data with data types
const reportData: ReportDataType = {
  collection: [
    {
      id: 'collection1',
      title: 'Collection Summary',
      description: 'Overview of all collections',
      category: 'collection',
    },
    {
      id: 'collection2',
      title: 'Outstanding Collections',
      description: 'List of pending collections',
      category: 'collection',
    },
  ],
  customer: [
    {
      id: 'customer1',
      title: 'Customer Activity',
      description: 'Customer transaction history',
      category: 'customer',
    },
    {
      id: 'customer2',
      title: 'Customer Insights',
      description: 'Analysis of customer behavior',
      category: 'customer',
    },
  ],
  disbursement: [
    {
      id: 'disbursement1',
      title: 'Payment Summary',
      description: 'Overview of all disbursements and payments',
      category: 'disbursement',
      dataType: 'payment',
    },
    {
      id: 'disbursement2',
      title: 'Pending Disbursements',
      description: 'List of pending disbursements',
      category: 'disbursement',
    },
  ],
  expense: [
    {
      id: 'expense1',
      title: 'Budget Utilization',
      description: 'Analysis of budget allocation and spending',
      category: 'expense',
      dataType: 'budget',
    },
    {
      id: 'expense2',
      title: 'Expense Categories',
      description: 'Breakdown of expenses by category',
      category: 'expense',
    },
  ],
  financial: [
    {
      id: 'financial1',
      title: 'Balance Sheet',
      description: 'Current financial position',
      category: 'financial',
    },
    {
      id: 'financial2',
      title: 'Profit & Loss',
      description: 'Revenue and expense summary',
      category: 'financial',
    },
    {
      id: 'financial3',
      title: 'Cash Flow Statement',
      description: 'Cash inflow and outflow analysis',
      category: 'financial',
    },
  ],
  inventory: [
    {
      id: 'inventory1',
      title: 'Inventory Status',
      description: 'Current inventory levels',
      category: 'inventory',
    },
    {
      id: 'inventory2',
      title: 'Stock Movement',
      description: 'Inventory movement analysis',
      category: 'inventory',
    },
  ],
  tax: [
    {
      id: 'tax1',
      title: 'Tax Summary',
      description: 'Overview of tax obligations',
      category: 'tax',
    },
    {
      id: 'tax2',
      title: 'VAT Report',
      description: 'Value-added tax analysis',
      category: 'tax',
    },
  ],
  vendor: [
    {
      id: 'vendor1',
      title: 'Vendor Performance',
      description: 'Analysis of vendor reliability',
      category: 'vendor',
    },
    {
      id: 'vendor2',
      title: 'Vendor Payments',
      description: 'Summary of payments to vendors',
      category: 'vendor',
    },
  ],
};

// Frequent reports with proper typing
const frequentReports: Report[] = [
  {
    id: 'financial1',
    title: 'Balance Sheet',
    description: 'Current financial position',
    category: 'financial',
  },
  {
    id: 'disbursement1',
    title: 'Payment Summary',
    description: 'Overview of all disbursements and payments',
    category: 'disbursement',
    dataType: 'payment',
  },
  {
    id: 'expense1',
    title: 'Budget Utilization',
    description: 'Analysis of budget allocation and spending',
    category: 'expense',
    dataType: 'budget',
  },
];

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Payment Summary Report Component

// Report View Content Component
const ReportViewContent: React.FC<{
  report: Report | null;
  data: ReportData;
}> = ({ report, data }) => {
  if (!report) return null;

  const categoryInfo = reportCategories.find(
    (cat) => cat.id === report.category
  );
  const icon = categoryInfo?.icon || <FileText className="h-5 w-5" />;

  // Determine which report component to render based on the report dataType
  const renderReportContent = () => {
    if (report.dataType === 'payment') {
      return (
        <PaymentSummaryReport
          reportPeriod={data.reportPeriod}
          payments={data.payments}
          kpis={data.paymentKpis}
        />
      );
    } else if (report.dataType === 'budget') {
      // Use the imported BudgetUtilizationReport component
      return (
        <BudgetUtilizationReport
          reportPeriod={data.reportPeriod}
          budgets={data.budgets}
          kpis={data.budgetKpis}
        />
      );
    } else {
      // Default placeholder for other report types
      return (
        <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">
            Report content would be displayed here
          </p>
        </div>
      );
    }
  };

  return (
    <div className="w-full min-h-[87.5vh] max-w-5xl ">
      <div className="flex items-center mb-6"></div>

      <div className="mb-6">{renderReportContent()}</div>
    </div>
  );
};

const ReportsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportCategoryId>('frequent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isGlobalSearch, setIsGlobalSearch] = useState(true); // Default to global search
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get all reports
  const getAllReports = (): Report[] => {
    return Object.values(reportData).flat();
  };

  // Get reports for the active tab
  const getActiveReports = (): Report[] => {
    if (activeTab === 'all') {
      return getAllReports();
    } else if (activeTab === 'frequent') {
      return frequentReports;
    }

    // Now TypeScript knows this is a valid key for reportData
    return reportData[activeTab] || [];
  };

  // Filter reports based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(getActiveReports());
      return;
    }

    const query = searchQuery.toLowerCase();

    // If global search is enabled, search across all reports
    const reportsToSearch = isGlobalSearch
      ? getAllReports()
      : getActiveReports();

    const filtered = reportsToSearch.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query)
    );

    setFilteredReports(filtered);
  }, [searchQuery, activeTab, isGlobalSearch]);

  // When tab changes and no search is active, reset filtered reports
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(getActiveReports());
    }
  }, [activeTab]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
    // Don't clear selectedReport immediately to avoid UI flicker during close animation
    setTimeout(() => {
      setSelectedReport(null);
    }, 300);
  };

  const renderReportCard = (report: Report) => {
    // Determine which icon to show based on the report's category
    const categoryInfo = reportCategories.find(
      (cat) => cat.id === report.category
    );
    const icon = categoryInfo?.icon || <FileText className="h-5 w-5" />;

    return (
      <Card
        key={report.id}
        className="hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => handleViewReport(report)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{report.title}</CardTitle>
          </div>
          <CardDescription>{report.description}</CardDescription>
          {isGlobalSearch && searchQuery.trim() !== '' && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {categoryInfo?.label || 'Report'}
              </span>
            </div>
          )}
        </CardHeader>
        <CardFooter className="bg-gray-50 border-t flex justify-between items-center pt-3 pb-3">
          <div className="flex space-x-2">
            <button
              className="p-1 rounded-full hover:bg-gray-200"
              title="Download Report"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Download report: ${report.id}`);
              }}
            >
              <Download className="h-4 w-4 text-gray-500" />
            </button>
            <button
              className="p-1 rounded-full hover:bg-gray-200"
              title="Print Report"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Print report: ${report.id}`);
              }}
            >
              <Printer className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              View Report
            </span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Get the active tab category info
  const activeTabInfo = reportCategories.find((cat) => cat.id === activeTab);

  // Initial tabs to show (frequent, all, financial)
  const initialTabs = reportCategories.slice(0, 5);

  // Additional tabs that will be shown in the dropdown
  const additionalTabs = reportCategories.slice(5);

  return (
    <div className="px-14">
      {/* Custom tab styling as per your example */}
      <div className="flex w-fit bg-[#F3FBFB] mt-7">
        {/* Initial tabs that are always visible */}
        {initialTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-gray-500 duration-500 ease-in-out ${
              activeTab === tab.id &&
              'border-b border-green-900 text-green-900 font-normal'
            } cursor-pointer flex items-center`}
          >
            <p>{tab.label.replace(' Reports', '')}</p>
          </div>
        ))}

        {/* Additional tabs - these could be in a dropdown */}
        {additionalTabs.length > 0 && (
          <div className="relative group">
            <div className="px-4 py-2.5 text-gray-500 cursor-pointer flex items-center">
              <p>More</p>
            </div>
            <div className="absolute hidden group-hover:block bg-white shadow-md z-10 min-w-[200px]">
              {additionalTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-gray-500 hover:bg-[#F3FBFB] cursor-pointer flex items-center ${
                    activeTab === tab.id && 'text-green-900 font-normal'
                  }`}
                >
                  {tab.icon}
                  <p>{tab.label.replace(' Reports', '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search bar with global search toggle */}
      <div className="mt-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-4 w-full border border-gray-200 rounded-[2px] outline-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isGlobalSearch}
                  onChange={() => setIsGlobalSearch(!isGlobalSearch)}
                />
                <div
                  className={`block w-10 h-6 rounded-full ${
                    isGlobalSearch ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                    isGlobalSearch ? 'transform translate-x-4' : ''
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-sm font-medium text-gray-700">
                {isGlobalSearch
                  ? 'Search all reports'
                  : 'Search current tab only'}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Search results count when searching */}
      {searchQuery.trim() !== '' && (
        <div className="mb-4 text-sm text-gray-500">
          Found {filteredReports.length} report
          {filteredReports.length !== 1 ? 's' : ''} matching &apos;{searchQuery}
          &apos;
          {isGlobalSearch && ` across all categories`}
          {!isGlobalSearch &&
            ` in ${
              reportCategories.find((cat) => cat.id === activeTab)?.label ||
              'selected category'
            }`}
        </div>
      )}

      {/* Tab title heading */}
      <div className="mb-6 mt-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-medium text-gray-800">
            {activeTabInfo?.label || 'Reports'}
          </h1>
        </div>
        {activeTab === 'frequent' && (
          <p className="text-sm text-gray-500 mt-1">
            Your most commonly used reports
          </p>
        )}
        {activeTab === 'all' && (
          <p className="text-sm text-gray-500 mt-1">
            All available reports across categories
          </p>
        )}
      </div>

      {/* Custom ScrollShadow with CSS to hide scrollbar */}
      <div className="custom-scroll-container">
        <ScrollShadow
          className="h-[600px] custom-scrollbar"
          hideScrollBar
          size={100}
          orientation="vertical"
        >
          {/* No results message */}
          {filteredReports.length === 0 && (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium">No reports found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery.trim() !== ''
                  ? `Try adjusting your search or ${
                      isGlobalSearch
                        ? 'use different keywords'
                        : 'enable "Search all reports"'
                    }`
                  : 'No reports available in this category'}
              </p>
            </div>
          )}

          {/* Reports grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report, index) => (
              <div key={report.id}>{renderReportCard(report)}</div>
            ))}
          </div>
        </ScrollShadow>
      </div>

      {/* Using the existing Slider component instead of a custom modal */}
      {selectedReport && (
        <Slider
          edit={false}
          title={selectedReport.title}
          open={isReportModalOpen}
          setOpen={setIsReportModalOpen}
          closeButton={false}
          onOpen={() => {
            console.log(`Opening report: ${selectedReport.id}`);
          }}
        >
          <ReportViewContent report={selectedReport} data={sampleData} />
        </Slider>
      )}

      {/* CSS to hide scrollbar */}
      <style jsx global>{`
        .custom-scroll-container {
          position: relative;
          width: 100%;
        }

        .custom-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
          background: transparent;
        }

        .custom-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default ReportsContent;
