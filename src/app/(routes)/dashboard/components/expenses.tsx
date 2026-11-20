'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Chart from './dashboardChart';
import BalanceBox from './balanceBoxes';
import PieChart from '../../../charts/piechart';
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

const DashboardExpenses = () => {
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

  // Fetch bills and budgets with date filtering
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills-dashboard', calculatedDateRange],
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
  });
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets-dashboard'],
    queryFn: async () => {
      const response = await axios.get('/budgets');
      return response.data;
    },
  });

  const bills = billsData?.data || [];
  const budgets = budgetsData?.data || [];

  // Group expenses by person (madeTo or vendor)
  const expensesByPerson: Record<string, number> = {};
  bills.forEach((bill: any) => {
    const person = bill.customer?.firstName
      ? `${bill.customer.firstName} ${bill.customer.lastName}`
      : bill.vendor?.name || '-';
    expensesByPerson[person] =
      (expensesByPerson[person] || 0) + (parseFloat(bill.invoiceTotal) || 0);
  });
  const personList = Object.entries(expensesByPerson).map(([name, amount]) => ({
    name,
    amount,
  }));
  personList.sort((a, b) => b.amount - a.amount);

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  bills.forEach((bill: any) => {
    const category = bill.invoiceType || 'Other';
    expensesByCategory[category] =
      (expensesByCategory[category] || 0) +
      (parseFloat(bill.invoiceTotal) || 0);
  });
  const categoryList = Object.entries(expensesByCategory).map(
    ([name, amount]) => ({ name, amount })
  );
  categoryList.sort((a, b) => b.amount - a.amount);

  // Pie chart data for categories
  const pieChartData = categoryList.map((item) => ({
    name: item.name,
    value: item.amount,
  }));

  // Format numbers for display
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

  if (billsLoading || budgetsLoading) {
    return (
      <div className="pt-3 ">
        <div className="flex flex-col grow h-full">
          {/* Date Filter Buttons - Keep them visible during loading */}
          <div className="flex gap-2 mb-2">
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
          <div className="w-full flex space-x-5">
            <div className="mt-5 w-[50%] w-full py-2">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="w-[50%] mt-2">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-5 pb-5 grow">
                <div className="flex flex-col border grow">
                  <div className="flex border-b items-center p-4">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="flex flex-col px-4 gap-2 my-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex w-full border-b py-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4 h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="ml-4 mt-2 h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex space-x-5 mt-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-[50%] border">
              <div className="w-full border-b py-3 bg-[#F3FBFB]">
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
              </div>
              <div className="flex space-x-5 w-full px-2">
                <div className="my-5 w-[50%] h-32 bg-gray-200 rounded"></div>
                <div className="w-[50%] flex-1 flex-col w-full justify-between">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="flex justify-between py-4 border-b w-full gap-2"
                    >
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="pt-3">
        <div className="flex flex-col grow h-full">
          {/* Date Filter Buttons */}
          <div className="flex gap-2 mb-2">
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

          <div>
            <BalanceBox
              dateRange={calculatedDateRange}
              isLoading={billsLoading || budgetsLoading}
            />
          </div>
          <div className="w-full flex space-x-5">
            <div className="mt-5 w-[50%] w-full py-2">
              {/* You can update Chart to use real data if needed */}
              <Chart />
            </div>
            <div className="w-[50%] mt-2">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-5 pb-5 grow">
                <div className="flex flex-col border grow bg-white">
                  <div className="flex border-b items-center p-4">
                    <h1 className="text-[18px]">Total Expenses by Person</h1>
                  </div>
                  <div className="flex flex-col px-4 gap-2 my-4">
                    {personList.map((data, index) => (
                      <div
                        key={index}
                        className="flex w-full border-b py-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                            {data.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="ml-4">
                            <div className=" text-gray-900">{data.name}</div>
                          </div>
                        </div>
                        <div className="ml-4 mt-2">
                          <div className="text-gray-900 flex justify-end">
                            {formatCurrency(data.amount as number)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex space-x-5 mt-8">
          {/* <div className="w-[50%] border">
            <div className="w-full border-b py-3 bg-[#F3FBFB]">
              <h3>Expenses by Category</h3>
            </div>
            <div className="flex space-x-5 w-full px-2">
              <div className="my-5 w-[50%]">
                {/* Pass real pie chart data */}
          {/* <PieChart
                  data={pieChartData}
                  title="Expenses by Category"
                  width={200}
                />
              </div>
              <div className="w-[50%]">
                <div className="flex-1 flex-col w-full justify-between">
                  {categoryList.map((items, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-4 border-b w-full gap-2"
                    >
                      <div>{items.name}</div>
                      <div>{formatCurrency(items.amount as number)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
          {/* <div className="w-[50%] border">
            <div className="w-full border-b py-3 bg-[#F3FBFB]">
              <h3>Expenses by Category</h3>
            </div>
            <div className="flex space-x-5 w-full px-2">
              <div className="my-5 w-[50%]">
                <PieChart
                  data={pieChartData}
                  title="Expenses by Category"
                  width={200}
                />
              </div>
              <div className="w-[50%]">
                <div className="flex-1 flex-col w-full justify-between">
                  {categoryList.map((items, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-4 border-b w-full gap-2"
                    >
                      <div>{items.name}</div>
                      <div>{formatCurrency(items.amount as number)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
export default DashboardExpenses;
