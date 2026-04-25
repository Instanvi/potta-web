import {
  ArrowUp,
  CalendarIcon,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import React, { FC, useState, useMemo } from 'react';
import {
  addDays,
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@potta/app/(routes)/vendors/utils/api';
import { pottaAnalyticsService } from '@potta/services/analyticsService';

interface VendorMetric {
  name: string;
  value: number;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isCurrency?: boolean;
}

const periods = ['Yesterday', 'Today', 'This week', 'This Month', 'Custom'];

// Helper function to conditionally join classNames
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const VendorsBox: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Calculate date range based on selected period
  const calculatedDateRange = useMemo(() => {
    const now = new Date();

    switch (selectedPeriod) {
      case 'Yesterday':
        const yesterday = subDays(now, 1);
        return { from: yesterday, to: yesterday };
      case 'Today':
        return { from: now, to: now };
      case 'This week':
        return { from: startOfWeek(now), to: endOfWeek(now) };
      case 'This Month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'Custom':
        return date;
      default:
        return { from: now, to: now };
    }
  }, [selectedPeriod, date]);

  // Fetch vendor data with date filtering
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: [
      'vendors-analytics',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const filter = {
        page: 1,
        limit: 1000, // Get all vendors for analytics
      };
      return await vendorApi.getAll(filter);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch vendor payment analytics (AP Balance)
  const { data: apBalanceData, isLoading: apLoading } = useQuery({
    queryKey: [
      'ap-balance',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const params: any = {
        metrics: ['vendor_running_balance'],
        dimensions: ['time'],
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
        'ap_balance',
        params
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate vendor metrics
  const vendorMetrics = useMemo((): VendorMetric[] => {
    if (!vendorsData?.data) {
      return [
        {
          name: 'Outstanding Payments',
          value: 0,
          icon: <DollarSign className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          isCurrency: true,
        },
        {
          name: 'Overdue Payments',
          value: 0,
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          isCurrency: true,
        },
        {
          name: 'Total Vendors',
          value: 0,
          icon: <Users className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          name: 'KYC Verified',
          value: 0,
          percentage: 0,
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
      ];
    }

    const vendors = vendorsData.data;
    const totalVendors = vendors.length;
    const kycVerified = vendors.filter((v) => v.isKYCVerified).length;
    const activeVendors = vendors.filter((v) =>
      ['ACTIVE', 'APPROVED'].includes(v.status)
    ).length;

    // Calculate outstanding payments from AP balance analytics
    // The API returns an array of monthly data, we need to sum all vendor_running_balance values
    const outstandingPayments =
      apBalanceData?.data?.reduce((total: number, item: any) => {
        return total + (item.vendor_running_balance || 0);
      }, 0) || 0;

    // Calculate overdue payments (vendors with high balances and rejected status)
    const overduePayments = vendors.reduce((total, vendor) => {
      const balance = parseFloat(vendor.openingBalance || '0');
      const isOverdue = vendor.status === 'REJECTED' && balance > 0;
      return total + (isOverdue ? balance : 0);
    }, 0);

    return [
      {
        name: 'Outstanding Payments',
        value: outstandingPayments,
        icon: <DollarSign className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        isCurrency: true,
      },
      {
        name: 'Overdue Payments',
        value: overduePayments,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        isCurrency: true,
      },
      {
        name: 'Active Vendors',
        value: activeVendors,
        percentage:
          totalVendors > 0
            ? Math.round((activeVendors / totalVendors) * 100)
            : 0,
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        name: 'KYC Verified',
        value: kycVerified,
        percentage:
          totalVendors > 0 ? Math.round((kycVerified / totalVendors) * 100) : 0,
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
    ];
  }, [vendorsData, apBalanceData]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (!date?.from) return '';
    if (!date?.to) return format(date.from, 'PPP');
    return `${format(date.from, 'PPP')} - ${format(date.to, 'PPP')}`;
  };

  // Display the selected date range on the Custom button when it's selected
  const getCustomButtonText = () => {
    if (selectedPeriod === 'Custom' && date?.from) {
      // Show abbreviated date format on the button
      if (!date.to) return format(date.from, 'MMM d, yyyy');
      if (
        date.from.getFullYear() === date.to.getFullYear() &&
        date.from.getMonth() === date.to.getMonth()
      ) {
        // Same month and year
        return `${format(date.from, 'MMM d')} - ${format(date.to, 'd, yyyy')}`;
      }
      return `${format(date.from, 'MMM d')} - ${format(
        date.to,
        'MMM d, yyyy'
      )}`;
    }
    return 'Custom';
  };

  return (
    <div className="space-y-14">
      <div className="flex gap-2 mb-6 ml-3">
        {periods.map((period) => {
          if (period !== 'Custom') {
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-900 text-white'
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
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-900 text-white'
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
                  {/* Date range header */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
                    <h3 className="font-medium text-center">
                      {formatDateRange()}
                    </h3>
                  </div>
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      className="bg-white"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => {
                          // Handle applying the date range
                          console.log('Selected date range:', date);
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
      <div className="grid grid-cols-4 w-[95%]">
        {vendorMetrics.map((metric: VendorMetric, id: number) => {
          return (
            <div key={id} className="w-fit h-36 p-5">
              <div className="flex gap-1 items-center">
                <div>
                  <p className="font-medium text-xl">{metric.name}</p>
                </div>
                {metric.percentage !== undefined && (
                  <div>
                    <button
                      className={`text-md font-medium rounded-full px-2 py-0.5 flex items-center ${metric.bgColor} ${metric.color}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <p>{metric.percentage}%</p>
                    </button>
                  </div>
                )}
              </div>
              <div className="h-1 font-medium w-full mt-5 text-4xl">
                {metric.isCurrency
                  ? formatCurrency(metric.value)
                  : metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorsBox;
