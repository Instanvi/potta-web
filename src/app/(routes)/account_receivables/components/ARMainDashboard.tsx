'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar as CalendarLucide,
} from 'lucide-react';

// Import modular components
import ARHeader from './ARHeader';
import ARMetrics from './ARMetrics';
import CollectionSummary from './CollectionSummary';
import InvoiceBreakdown from './InvoiceBreakdown';
import CollectionChart from './CollectionChart';
import TopCustomers from './TopCustomers';
import RecentInvoices from './RecentInvoices';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';
import { pottaAnalyticsService } from '@potta/services/analyticsService';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import { invoiceApi } from '@potta/app/(routes)/account_receivables/invoice/_utils/api';

interface ARMainDashboardProps {
  type?: 'ar';
}

const periods = ['Yesterday', 'Today', 'This week', 'This Month', 'Custom'];

// Helper function to get date range based on period
const getDateRange = (period: string, customDate?: DateRange): DateRange => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  switch (period) {
    case 'Yesterday':
      return { from: yesterday, to: yesterday };
    case 'Today':
      return { from: today, to: today };
    case 'This week':
      return { from: startOfWeek, to: today };
    case 'This Month':
      return { from: startOfMonth, to: today };
    case 'Custom':
      return customDate || { from: today, to: today };
    default:
      return { from: today, to: today };
  }
};

const ARMainDashboard: React.FC<ARMainDashboardProps> = ({ type = 'ar' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [customDate, setCustomDate] = useState<DateRange | undefined>();

  // Memoize the date range calculation to prevent unnecessary re-renders
  const calculatedDateRange = useMemo(() => {
    return getDateRange(selectedPeriod, customDate);
  }, [
    selectedPeriod,
    customDate?.from?.toDateString(),
    customDate?.to?.toDateString(),
  ]);

  // Fetch AR balance data for collection analysis
  const { data: arBalanceData, isLoading: arLoading } = useQuery({
    queryKey: [
      'ar-balance',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const timeGranularity = 'monthly';
      const params: any = {
        metrics: ['customer_running_balance'],
        dimensions: ['time'],
        time_granularity: timeGranularity,
        use_mock_data: true,
      };

      // Add date filtering
      if (calculatedDateRange?.from) {
        params.start_date = calculatedDateRange.from.toISOString();
      }
      if (calculatedDateRange?.to) {
        params.end_date = calculatedDateRange.to.toISOString();
      }

      return await pottaAnalyticsService.finance.getAnalytics(
        'ar_balance',
        params
      );
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Fetch revenue data for customer analysis
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: [
      'revenue-customers',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const params: any = {
        metrics: ['total_revenue'],
        dimensions: ['time', 'customer'],
        time_granularity: 'monthly',
        use_mock_data: true,
      };

      // Add date filtering
      if (calculatedDateRange?.from) {
        params.start_date = calculatedDateRange.from.toISOString();
      }
      if (calculatedDateRange?.to) {
        params.end_date = calculatedDateRange.to.toISOString();
      }

      return await pottaAnalyticsService.finance.getAnalytics(
        'revenue',
        params
      );
    },
  });

  // Fetch real customer data
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomers({
      page: 1,
      limit: 100,
    });

  // Fetch real invoice data with date filtering
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: [
      'invoices-ar-dashboard',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const params: any = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Add date filtering for invoices
      if (calculatedDateRange?.from) {
        params.startDate = calculatedDateRange.from.toISOString();
      }
      if (calculatedDateRange?.to) {
        params.endDate = calculatedDateRange.to.toISOString();
      }

      return await invoiceApi.getAll(params);
    },
  });

  // Process AR balance data
  const arData = arBalanceData?.data || [];
  const revenueDataArray = revenueData?.data || [];
  const customers = customersData?.data || [];
  const invoices = invoicesData?.data || [];

  // Process data for dashboard components
  const collectionData = useMemo(() => {
    // Filter invoices by date range if needed (client-side fallback)
    let filteredInvoices = invoices;

    if (calculatedDateRange?.from || calculatedDateRange?.to) {
      filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(
          invoice.createdAt || invoice.issuedDate || new Date()
        );
        const fromDate = calculatedDateRange?.from;
        const toDate = calculatedDateRange?.to;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    // Calculate total collected from filtered invoice data using invoiceTotal
    const totalCollected = filteredInvoices.reduce(
      (sum: number, invoice: any) =>
        sum + (parseFloat(invoice.invoiceTotal) || 0),
      0
    );
    // Calculate total invoices from filtered data
    const totalInvoices = filteredInvoices.length;
    const averageInvoiceValue =
      totalInvoices > 0 ? totalCollected / totalInvoices : 0;

    // Calculate collection rate based on paid vs total invoices
    const paidInvoices = filteredInvoices.filter(
      (invoice: any) =>
        invoice.status === 'PAID' || invoice.status === 'APPROVED'
    ).length;
    const collectionRate =
      totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    return {
      totalCollected,
      totalInvoices,
      averageInvoiceValue,
      collectionRate: Math.round(collectionRate),
    };
  }, [invoices, calculatedDateRange]);

  // Calculate Days Sales Outstanding (DSO) from actual invoice data
  const calculateDSO = useMemo(() => {
    // Filter invoices by date range if needed (client-side fallback)
    let filteredInvoicesForDSO = invoices;

    if (calculatedDateRange?.from || calculatedDateRange?.to) {
      filteredInvoicesForDSO = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(
          invoice.createdAt || invoice.issuedDate || new Date()
        );
        const fromDate = calculatedDateRange?.from;
        const toDate = calculatedDateRange?.to;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    if (filteredInvoicesForDSO.length === 0) return 0;

    const totalOutstanding = filteredInvoicesForDSO.reduce(
      (sum: number, invoice: any) => {
        // Only count outstanding invoices (not paid)
        if (invoice.status === 'PAID' || invoice.status === 'APPROVED')
          return sum;

        const invoiceDate = new Date(invoice.issuedDate || invoice.createdAt);
        const daysOutstanding = Math.floor(
          (new Date().getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const amount = parseFloat(invoice.invoiceTotal) || 0;

        return sum + amount * daysOutstanding;
      },
      0
    );

    const totalOutstandingAmount = filteredInvoicesForDSO.reduce(
      (sum: number, invoice: any) => {
        if (invoice.status === 'PAID' || invoice.status === 'APPROVED')
          return sum;
        return sum + (parseFloat(invoice.invoiceTotal) || 0);
      },
      0
    );

    return totalOutstandingAmount > 0
      ? Math.round(totalOutstanding / totalOutstandingAmount)
      : 0;
  }, [invoices, calculatedDateRange]);

  // Calculate trends by comparing with previous period data
  const calculateTrends = useMemo(() => {
    // For now, we'll calculate basic trends based on current data
    // In a real implementation, you'd compare with historical data

    const collectionRateTrend =
      collectionData.collectionRate > 50 ? 'up' : 'down';
    const collectionRateChange =
      collectionData.collectionRate > 50 ? '+3%' : '-2%';

    const avgInvoiceTrend =
      collectionData.averageInvoiceValue > 100000 ? 'up' : 'down';
    const avgInvoiceChange =
      collectionData.averageInvoiceValue > 100000 ? '+5%' : '-1%';

    const customerTrend = customers.length > 5 ? 'up' : 'down';
    const customerChange =
      customers.length > 5 ? `+${Math.min(customers.length - 5, 12)}` : '-2';

    const dsoTrend = calculateDSO < 30 ? 'down' : 'up';
    const dsoChange = calculateDSO < 30 ? '-2' : '+5';

    return {
      collectionRate: {
        trend: collectionRateTrend,
        change: collectionRateChange,
      },
      avgInvoice: { trend: avgInvoiceTrend, change: avgInvoiceChange },
      customers: { trend: customerTrend, change: customerChange },
      dso: { trend: dsoTrend, change: dsoChange },
    };
  }, [collectionData, customers.length, calculateDSO]);

  const arMetrics = [
    {
      name: 'Days Sales Outstanding',
      value: calculateDSO,
      change: calculateTrends.dso.change,
      trend: calculateTrends.dso.trend as 'up' | 'down',
      icon: CalendarLucide,
    },
    {
      name: 'Collection Rate',
      value: collectionData.collectionRate,
      change: calculateTrends.collectionRate.change,
      trend: calculateTrends.collectionRate.trend as 'up' | 'down',
      icon: TrendingUp,
    },
    {
      name: 'Average Invoice Value',
      value: collectionData.averageInvoiceValue,
      change: calculateTrends.avgInvoice.change,
      trend: calculateTrends.avgInvoice.trend as 'up' | 'down',
      icon: DollarSign,
    },
    {
      name: 'Active Customers',
      value: customers.length,
      change: calculateTrends.customers.change,
      trend: calculateTrends.customers.trend as 'up' | 'down',
      icon: Users,
    },
  ];

  // Group AR data by payment method from real invoice data
  const terminalsData = useMemo(() => {
    // Filter invoices by date range if needed (client-side fallback)
    let filteredInvoices = invoices;

    if (calculatedDateRange?.from || calculatedDateRange?.to) {
      filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(
          invoice.createdAt || invoice.issuedDate || new Date()
        );
        const fromDate = calculatedDateRange?.from;
        const toDate = calculatedDateRange?.to;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    const terminals: Record<string, number> = {};
    filteredInvoices.forEach((invoice: any) => {
      const method = invoice.paymentMethod || 'OTHER';
      terminals[method] =
        (terminals[method] || 0) + (parseFloat(invoice.invoiceTotal) || 0);
    });

    // If no payment method data, provide default distribution
    if (Object.keys(terminals).length === 0) {
      return {
        BANK_TRANSFER: collectionData.totalCollected * 0.4,
        MOBILE_MONEY: collectionData.totalCollected * 0.35,
        CASH: collectionData.totalCollected * 0.25,
      };
    }

    return terminals;
  }, [invoices, collectionData.totalCollected, calculatedDateRange]);

  // Group revenue data by customer (top customers) using real customer data
  const incomeData = useMemo(() => {
    // Filter invoices by date range if needed (client-side fallback)
    let filteredInvoices = invoices;

    if (calculatedDateRange?.from || calculatedDateRange?.to) {
      filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(
          invoice.createdAt || invoice.issuedDate || new Date()
        );
        const fromDate = calculatedDateRange?.from;
        const toDate = calculatedDateRange?.to;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    const income: Record<string, number> = {};

    // Group filtered invoices by customer using embedded customer object
    filteredInvoices.forEach((invoice: any) => {
      const customer = invoice.customer;
      const customerName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
          customer.contactPerson ||
          `Customer ${customer.customerId || customer.uuid?.slice(0, 8)}`
        : 'Unknown Customer';

      const amount = parseFloat(invoice.invoiceTotal) || 0;
      income[customerName] = (income[customerName] || 0) + amount;
    });

    // If no data, provide fallback with real customer names
    if (Object.keys(income).length === 0 && customers.length > 0) {
      const fallbackIncome: Record<string, number> = {};
      customers.slice(0, 5).forEach((customer: any, index: number) => {
        const customerName =
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
          customer.contactPerson ||
          `Customer ${customer.customerId || customer.uuid?.slice(0, 8)}`;
        fallbackIncome[customerName] =
          collectionData.totalCollected * (0.3 - index * 0.05);
      });
      return fallbackIncome;
    }

    return income;
  }, [invoices, customers, collectionData.totalCollected, calculatedDateRange]);

  const recentInvoices = useMemo(() => {
    // Filter invoices by date range if needed (client-side fallback)
    let filteredInvoices = invoices;

    if (calculatedDateRange?.from || calculatedDateRange?.to) {
      filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(
          invoice.createdAt || invoice.issuedDate || new Date()
        );
        const fromDate = calculatedDateRange?.from;
        const toDate = calculatedDateRange?.to;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    // Use filtered invoice data
    return filteredInvoices.slice(0, 5).map((invoice: any) => {
      const customer = invoice.customer;
      const customerName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
          customer.contactPerson ||
          `Customer ${customer.customerId || customer.uuid?.slice(0, 8)}`
        : 'Unknown Customer';

      return {
        id: invoice.invoiceNumber || invoice.uuid || `INV-${invoice.id}`,
        customer: customerName,
        amount: parseFloat(invoice.invoiceTotal) || 0,
        status: invoice.status || 'DRAFT',
        date:
          invoice.createdAt || invoice.issuedDate || new Date().toISOString(),
      };
    });
  }, [invoices, calculatedDateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Memoize the date range formatting
  const formatDateRange = useCallback(() => {
    if (!customDate?.from) return '';
    if (!customDate?.to) return format(customDate.from, 'PPP');
    return `${format(customDate.from, 'PPP')} - ${format(
      customDate.to,
      'PPP'
    )}`;
  }, [customDate?.from?.toDateString(), customDate?.to?.toDateString()]);

  // Memoize the custom button text
  const getCustomButtonText = useCallback(() => {
    if (selectedPeriod === 'Custom' && customDate?.from) {
      if (!customDate.to) return format(customDate.from, 'MMM d, yyyy');
      if (
        customDate.from.getFullYear() === customDate.to.getFullYear() &&
        customDate.from.getMonth() === customDate.to.getMonth()
      ) {
        return `${format(customDate.from, 'MMM d')} - ${format(
          customDate.to,
          'd, yyyy'
        )}`;
      }
      return `${format(customDate.from, 'MMM d')} - ${format(
        customDate.to,
        'MMM d, yyyy'
      )}`;
    }
    return 'Custom';
  }, [
    selectedPeriod,
    customDate?.from?.toDateString(),
    customDate?.to?.toDateString(),
  ]);

  // Memoize the period change handler
  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
    if (period !== 'Custom') {
      setCustomDate(undefined);
    }
  }, []);

  // Handle custom date selection
  const handleCustomDateChange = useCallback(
    (newDate: DateRange | undefined) => {
      setCustomDate(newDate);
    },
    []
  );

  if (arLoading || revenueLoading || customersLoading || invoicesLoading) {
    return (
      <div className="p-3 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="h-80 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-6">
      {/* Date Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {periods.map((period) => {
          if (period !== 'Custom') {
            return (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            );
          } else {
            return (
              <Popover key={period}>
                <PopoverTrigger>
                  <button
                    onClick={() => handlePeriodChange(period)}
                    className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-green-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getCustomButtonText()}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-md"
                  align="start"
                >
                  <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
                    <h3 className="font-medium text-center">
                      {formatDateRange()}
                    </h3>
                  </div>
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      defaultMonth={customDate?.from}
                      selected={customDate}
                      onSelect={handleCustomDateChange}
                      numberOfMonths={2}
                      className="bg-white"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-green-900 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => {
                          // Handle applying the date range
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }
        })}
      </div>

      {/* Header Section */}
      <ARHeader
        totalCollected={collectionData.totalCollected}
        totalInvoices={collectionData.totalInvoices}
        formatCurrency={formatCurrency}
      />

      {/* Key Metrics Section */}
      <ARMetrics metrics={arMetrics} formatCurrency={formatCurrency} />

      {/* Collection & Invoice Breakdown Section - Only show if we have data */}
      {collectionData.totalInvoices > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollectionSummary
            data={collectionData}
            formatCurrency={formatCurrency}
          />
          <InvoiceBreakdown
            data={terminalsData}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      {/* Collection Chart Section - Only show if we have data */}
      {collectionData.totalInvoices > 0 && (
        <CollectionChart data={invoices} formatCurrency={formatCurrency} />
      )}

      {/* Top Customers & Recent Invoices Section - Only show if we have data */}
      {collectionData.totalInvoices > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomers data={incomeData} formatCurrency={formatCurrency} />
          <RecentInvoices
            invoices={recentInvoices}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>
      )}

      {/* No Data Message - Show when no data for selected range */}
      {collectionData.totalInvoices === 0 && (
        <div className="bg-white p-8  text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 mb-4">
              No invoices found for the selected date range. Try selecting a
              different time period or adjust the filters for a better view.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARMainDashboard;
