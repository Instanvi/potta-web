import { ArrowUp, CalendarIcon } from 'lucide-react';
import React, { FC, useState, useMemo, useCallback } from 'react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';
import useGetAllInvoice from '../../../account_receivables/invoice/_hooks/useGetAllInvoice';

interface data {
  name?: string;
  percent?: number;
  price?: string;
}

const periods = ['Yesterday', 'Today', 'This week', 'This Month', 'Custom'];

// Helper function to conditionally join classNames
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

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

const ProformaInvoiceBox: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[1]); // Default to "Today"
  const [customDate, setCustomDate] = useState<DateRange | undefined>(
    undefined
  );

  // Memoize the date range calculation
  const calculatedDateRange = useMemo(() => {
    const range = getDateRange(selectedPeriod, customDate);
    return range;
  }, [
    selectedPeriod,
    customDate?.from?.toDateString(),
    customDate?.to?.toDateString(),
  ]);

  const filter = {
    limit: 100,
    page: 1,
    sortOrder: 'DESC' as const,
    sortBy: 'createdAt',
  };

  const { data, isLoading, error } = useGetAllInvoice(filter);

  // Calculate stats from proforma invoices
  const stats = useMemo(() => {
    if (!data?.data) return null;

    const proformaInvoices = data.data.filter(
      (inv: any) => inv.invoiceType === 'PROFORMA_INVOICE'
    );

    const totalAmount = proformaInvoices.reduce(
      (sum: number, inv: any) => sum + inv.invoiceTotal,
      0
    );

    const submitted = proformaInvoices.filter(
      (inv: any) => inv.status === 'ISSUED'
    );
    const approved = proformaInvoices.filter(
      (inv: any) => inv.status === 'APPROVED'
    );
    const rejected = proformaInvoices.filter(
      (inv: any) => inv.status === 'REJECTED'
    );
    const draft = proformaInvoices.filter((inv: any) => inv.status === 'DRAFT');

    return {
      total: {
        count: proformaInvoices.length,
        amount: totalAmount,
        percentage: 100,
      },
      submitted: {
        count: submitted.length,
        amount: submitted.reduce(
          (sum: number, inv: any) => sum + inv.invoiceTotal,
          0
        ),
        percentage:
          proformaInvoices.length > 0
            ? (submitted.length / proformaInvoices.length) * 100
            : 0,
      },
      approved: {
        count: approved.length,
        amount: approved.reduce(
          (sum: number, inv: any) => sum + inv.invoiceTotal,
          0
        ),
        percentage:
          proformaInvoices.length > 0
            ? (approved.length / proformaInvoices.length) * 100
            : 0,
      },
      rejected: {
        count: rejected.length,
        amount: rejected.reduce(
          (sum: number, inv: any) => sum + inv.invoiceTotal,
          0
        ),
        percentage:
          proformaInvoices.length > 0
            ? (rejected.length / proformaInvoices.length) * 100
            : 0,
      },
    };
  }, [data?.data]);

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

  // Memoize the stats data
  const datas = useMemo(() => {
    if (isLoading || error || !stats) {
      return [
        {
          name: 'Total',
          percent: 0,
          price: 'XAF 0',
        },
        {
          name: 'Submitted',
          percent: 0,
          price: 'XAF 0',
        },
        {
          name: 'Approved',
          percent: 0,
          price: 'XAF 0',
        },
        {
          name: 'Rejected',
          percent: 0,
          price: 'XAF 0',
        },
      ];
    }

    return [
      {
        name: 'Total',
        percent: stats.total.percentage,
        price: `XAF ${stats.total.amount.toLocaleString()}`,
      },
      {
        name: 'Submitted',
        percent: stats.submitted.percentage,
        price: `XAF ${stats.submitted.amount.toLocaleString()}`,
      },
      {
        name: 'Approved',
        percent: stats.approved.percentage,
        price: `XAF ${stats.approved.amount.toLocaleString()}`,
      },
      {
        name: 'Rejected',
        percent: stats.rejected.percentage,
        price: `XAF ${stats.rejected.amount.toLocaleString()}`,
      },
    ];
  }, [isLoading, error, stats]);

  // Handle period change
  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);

  // Handle custom date selection
  const handleCustomDateChange = useCallback(
    (newDate: DateRange | undefined) => {
      setCustomDate(newDate);
    },
    []
  );

  return (
    <div className="space-y-14">
      <div className="flex gap-2 mb-6 ml-3">
        {periods.map((period) => {
          if (period !== 'Custom') {
            return (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
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
                    onClick={() => handlePeriodChange(period)}
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
                        className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => {
                          console.log('Selected date range:', customDate);
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
        {isLoading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, id) => (
            <div key={id} className="w-fit h-36 p-5">
              <div className="flex gap-1">
                <div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mt-5"></div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-4 flex items-center justify-center h-36">
            <div className="text-center">
              <p className="text-red-500 text-sm">
                Failed to load proforma invoice statistics
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Please try again later
              </p>
            </div>
          </div>
        ) : (
          // Data state
          datas.map((item: data, id: number) => {
            return (
              <div key={id} className="w-fit h-36 p-5">
                <div className="flex gap-1">
                  <div>
                    <p className="font-medium text-xl">{item.name}</p>
                  </div>
                  <div>
                    <button className="text-md font-medium rounded-full px-2 py-0.5 flex items-center bg-green-50 text-green-600">
                      <ArrowUp className="h-4 w-4 " />
                      <p>{item.percent?.toFixed(1)}%</p>
                    </button>
                  </div>
                </div>
                <div className="h-1 w-full mt-5 text-4xl whitespace-nowrap">
                  {item.price}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProformaInvoiceBox;
