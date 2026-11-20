// 'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Chart from './dashboardChart';
import BalanceBox from './balanceBoxes';
import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';

interface Assets {
  image: string;
  transactionName: string;
  amount: string;
}

interface Income {
  transactionName: string;
  amount: string;
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

const DashboardCollection = () => {
  const [heights, setHeights] = useState<string>('');
  const [dashTopHeight, setDashTopHeight] = useState<string>('');
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

  // Fetch bills data for collection analysis with date filtering
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: [
      'bills-collection',
      calculatedDateRange?.from?.toISOString(),
      calculatedDateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const filter =
        calculatedDateRange?.from && calculatedDateRange?.to
          ? {
              fromDate: calculatedDateRange.from.toISOString(),
              toDate: calculatedDateRange.to.toISOString(),
            }
          : {};
      const response = await axios.get('/bills', { params: filter });
      return response.data;
    },
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnWindowFocus: false,
  });

  // Fetch budgets data for income analysis
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets-collection'],
    queryFn: async () => {
      const response = await axios.get('/budgets');
      return response.data;
    },
  });

  useEffect(() => {
    setHeights(window.innerHeight.toString());
    setDashTopHeight(localStorage.getItem('dashTopHeight') || '');
  }, []);

  const bills = billsData?.data || [];
  const budgets = budgetsData?.data || [];

  // Group bills by payment method (terminals)
  const terminalsData: Record<string, number> = {};
  bills.forEach((bill: any) => {
    const method = bill.paymentMethod || 'Other';
    terminalsData[method] =
      (terminalsData[method] || 0) + (parseFloat(bill.invoiceTotal) || 0);
  });

  // Group budgets by type (income drivers)
  const incomeData: Record<string, number> = {};
  budgets.forEach((budget: any) => {
    const type = budget.name || 'General Budget';
    const spent =
      parseFloat(budget.totalAmount) - parseFloat(budget.availableAmount);
    incomeData[type] = (incomeData[type] || 0) + spent;
  });

  // Format data for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      // Show abbreviated date format on the button
      if (!customDate.to) return format(customDate.from, 'MMM d, yyyy');
      if (
        customDate.from.getFullYear() === customDate.to.getFullYear() &&
        customDate.from.getMonth() === customDate.to.getMonth()
      ) {
        // Same month and year
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

  const datas: Assets[] = Object.entries(terminalsData)
    .map(([method, amount]) => ({
      image: '/icons/user.svg', // You can map specific icons based on payment method
      transactionName: method,
      amount: formatCurrency(amount),
    }))
    .sort(
      (a, b) =>
        parseFloat(b.amount.replace(/[^0-9.-]+/g, '')) -
        parseFloat(a.amount.replace(/[^0-9.-]+/g, ''))
    )
    .slice(0, 5); // Top 5 terminals

  const Incomes: Income[] = Object.entries(incomeData)
    .map(([type, amount]) => ({
      transactionName: type,
      amount: formatCurrency(amount),
    }))
    .sort(
      (a, b) =>
        parseFloat(b.amount.replace(/[^0-9.-]+/g, '')) -
        parseFloat(a.amount.replace(/[^0-9.-]+/g, ''))
    )
    .slice(0, 5); // Top 5 income drivers

  if (billsLoading || budgetsLoading) {
    return (
      <div className="pt-3 animate-pulse">
        <div className="flex flex-col grow h-full">
          {/* Date Filter Buttons - Keep them visible during loading */}
          <div className="flex gap-2 mb-6">
            {periods.map((period) => {
              if (period !== 'Custom') {
                return (
                  <button
                    key={period}
                    disabled
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
                  <button
                    key={period}
                    disabled
                    className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-green-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getCustomButtonText()}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </button>
                );
              }
            })}
          </div>

          <div>
            <BalanceBox
              dateRange={calculatedDateRange}
              isLoading={billsLoading || budgetsLoading}
            />
          </div>
          <div className="mt-5 w-full py-2">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pb-5 grow">
            <div className="flex flex-col border grow">
              <div className="flex border-b items-center w-full bg-[#F3FBFB] p-4">
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="flex flex-col px-4 gap-2 my-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex w-full border-b py-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div className="ml-4 h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="ml-4 h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col border grow">
                <div className="flex justify-between border-b items-center w-full bg-[#F3FBFB] p-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-4"></div>
                </div>
                <div className="flex flex-col px-4 gap-2 mt-4 divide-y">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 first:pt-0 items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div className="ml-4 h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div
        style={{ height: parseInt(heights) - parseInt(dashTopHeight) - 20 }}
        className="pt-3"
      >
        <div className="flex flex-col grow h-full">
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
                      {/* Date range header */}
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

          <div>
            <BalanceBox
              dateRange={calculatedDateRange}
              isLoading={billsLoading || budgetsLoading}
            />
          </div>
          <div className="mt-5 w-full  py-2">
            <Chart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-4 mt-5 pb-5 grow">
            <div className="flex flex-col  border grow">
              <div className="flex border-b items-center w-full bg-[#F3FBFB] p-4">
                <h1 className="text-[18px]">Collection by Terminals</h1>
              </div>
              <div className="flex flex-col px-4 gap-2 my-4">
                {datas.length > 0 ? (
                  datas.map((data, index) => (
                    <div
                      key={index}
                      className="flex w-full border-b py-2 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <img src={data.image} className="h-10 w-10" alt="" />
                        <div className="ml-4">
                          <div className=" text-gray-900">
                            {data.transactionName}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className=" text-gray-900 flex justify-end">
                          {data.amount}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No collection data available
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col  border grow">
                <div className="flex justify-between border-b items-center w-full bg-[#F3FBFB] p-4">
                  <h1 className="text-[18px]">Top Income Driver</h1>
                  <i className="ri-arrow-right-up-line"></i>
                </div>
                <div className="flex flex-col px-4 gap-2 mt-4 divide-y">
                  {Incomes.length > 0 ? (
                    Incomes.map((data, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 first:pt-0 items-center"
                      >
                        <div className="flex items-center gap-2">
                          <div className="ml-4">
                            <div className="font-normal text-gray-900">
                              {data.transactionName}
                            </div>
                          </div>
                        </div>
                        <div className=" text-gray-900 text-lg">
                          {data.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No income data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardCollection;
