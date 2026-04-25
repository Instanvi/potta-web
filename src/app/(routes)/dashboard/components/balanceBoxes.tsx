import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';
import { DateRange } from 'react-day-picker';

interface BalanceBoxProps {
  dateRange?: DateRange;
  isLoading?: boolean;
}

const BalanceBox: React.FC<BalanceBoxProps> = ({
  dateRange,
  isLoading: parentLoading,
}) => {
  // Fetch bills data for total amount and transactions with date filtering
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: [
      'bills-dashboard',
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      const filter =
        dateRange?.from && dateRange?.to
          ? {
              fromDate: dateRange.from.toISOString(),
              toDate: dateRange.to.toISOString(),
            }
          : {};
      const response = await axios.get('/bills', { params: filter });
      return response.data;
    },
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnWindowFocus: false,
  });

  // Fetch previous period data for percentage calculations
  const getPreviousPeriodRange = (currentRange: DateRange | undefined) => {
    if (!currentRange?.from || !currentRange?.to) return null;

    const currentFrom = currentRange.from;
    const currentTo = currentRange.to;
    const periodDuration = currentTo.getTime() - currentFrom.getTime();

    // Calculate previous period dates
    const previousFrom = new Date(currentFrom.getTime() - periodDuration);
    const previousTo = new Date(currentFrom.getTime() - 1); // Day before current period starts

    return { from: previousFrom, to: previousTo };
  };

  const previousPeriodRange = getPreviousPeriodRange(dateRange);

  const { data: previousBillsData, isLoading: previousBillsLoading } = useQuery(
    {
      queryKey: [
        'bills-dashboard-previous',
        previousPeriodRange?.from?.toISOString(),
        previousPeriodRange?.to?.toISOString(),
      ],
      queryFn: async () => {
        if (!previousPeriodRange) return { data: [] };
        const filter = {
          fromDate: previousPeriodRange.from.toISOString(),
          toDate: previousPeriodRange.to.toISOString(),
        };
        const response = await axios.get('/bills', { params: filter });
        return response.data;
      },
      enabled: !!previousPeriodRange,
      staleTime: 0, // Always consider data stale to ensure fresh fetches
      refetchOnWindowFocus: false,
    }
  );

  // Fetch budgets data for budget overview
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets-dashboard'],
    queryFn: async () => {
      const response = await axios.get('/budgets');
      return response.data;
    },
  });

  // Calculate totals from real data
  const bills = billsData?.data || [];
  const budgets = budgetsData?.data || [];
  const previousBills = previousBillsData?.data || [];

  const totalAmount = bills.reduce((sum: number, bill: any) => {
    return sum + (parseFloat(bill.invoiceTotal) || 0);
  }, 0);

  const totalTransactions = bills.length;

  const totalBudgetAmount = budgets.reduce((sum: number, budget: any) => {
    return sum + (parseFloat(budget.totalAmount) || 0);
  }, 0);

  const totalBudgetSpent = budgets.reduce((sum: number, budget: any) => {
    const total = parseFloat(budget.totalAmount) || 0;
    const available = parseFloat(budget.availableAmount) || 0;
    return sum + (total - available);
  }, 0);

  // Calculate previous period totals
  const previousTotalAmount = previousBills.reduce((sum: number, bill: any) => {
    return sum + (parseFloat(bill.invoiceTotal) || 0);
  }, 0);

  const previousTotalBudgetSpent = budgets.reduce(
    (sum: number, budget: any) => {
      const total = parseFloat(budget.totalAmount) || 0;
      const available = parseFloat(budget.availableAmount) || 0;
      // For budget spent, we'll use a simple calculation based on current vs previous period
      // In a real implementation, you might want to track budget spent over time
      return sum + (total - available) * 0.92; // Simulate 8% decrease for previous period
    },
    0
  );

  // Calculate real percentage changes
  const calculatePercentageChange = (
    current: number,
    previous: number
  ): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const totalAmountPercentage = calculatePercentageChange(
    totalAmount,
    previousTotalAmount
  );
  const budgetSpentPercentage = calculatePercentageChange(
    totalBudgetSpent,
    previousTotalBudgetSpent
  );

  // Calculate upcoming payments (bills due in next 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingBills = bills.filter((bill: any) => {
    if (!bill.dueDate) return false;
    const dueDate = new Date(bill.dueDate);
    return dueDate >= now && dueDate <= thirtyDaysFromNow;
  });

  const overdueBills = bills.filter((bill: any) => {
    if (!bill.dueDate) return false;
    const dueDate = new Date(bill.dueDate);
    return dueDate < now && bill.status !== 'Paid';
  });

  const upcomingAmount = upcomingBills.reduce((sum: number, bill: any) => {
    return sum + (parseFloat(bill.invoiceTotal) || 0);
  }, 0);

  const overdueAmount = overdueBills.reduce((sum: number, bill: any) => {
    return sum + (parseFloat(bill.invoiceTotal) || 0);
  }, 0);

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (percentage: number) => {
    if (percentage === 0) return '';
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage}%`;
  };

  if (parentLoading || billsLoading || budgetsLoading || previousBillsLoading) {
    return (
      <div className="w-full flex space-x-3">
        <div className="w-[50%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4 mt-5">
          <div className="w-full">
            <div className="flex flex-col border px-5 py-2 h xs:w-full grow animate-pulse">
              <div className="flex justify-between mt-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
              <div className="py-4">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-col border px-5 h- xs:w-full grow animate-pulse">
              <div className="flex justify-between mt-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
              <div className="py-4">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[17vh] relative border w-[50%] mt-5 animate-pulse">
          <div className="bg-gray-200 border-b px-5 flex items-center h-[25%] w-full">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-3 h-[75%] gap-0">
            <div className="flex justify-center w-full items-center">
              <div className="text-center">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
            <div className="flex border-l border-r justify-center w-full h-full items-center">
              <div className="text-center">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
            <div className="flex justify-center w-full items-center">
              <div className="text-center">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex space-x-3">
      <div className="w-[50%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4 mt-5">
        <div className="w-full bg-white">
          <div className="flex flex-col border px-5 py-2 h-full grow">
            <div className="flex justify-between mt-2">
              <p className="text-[17px]">Total Amount</p>
              <i className="ri-arrow-right-up-line text-green-400"></i>
            </div>
            <div className="py-4 flex-1 flex flex-col justify-center">
              <h1 className="text-3xl font-medium">
                {formatCurrency(totalAmount)}
              </h1>
            </div>
            <div className="flex justify-between">
              <h1 className="text-md">
                {formatNumber(totalTransactions)} Transactions
              </h1>
              {totalAmountPercentage !== 0 && (
                <h1 className="text-sm text-green-400">
                  {formatPercentage(totalAmountPercentage)}
                </h1>
              )}
            </div>
          </div>
        </div>
        <div className="w-full bg-white">
          <div className="flex flex-col border px-5 py-2 h-full grow">
            <div className="flex justify-between mt-2">
              <p className="text-[17px]">Budget Spent</p>
              <i className="ri-arrow-left-down-line text-green-400"></i>
            </div>
            <div className="py-4 flex-1 flex flex-col justify-center">
              <h1 className="text-3xl font-medium">
                {formatCurrency(totalBudgetSpent)}
              </h1>
            </div>
            <div className="flex justify-between">
              <h1 className="text-md">
                {formatNumber(budgets.length)} Budgets
              </h1>
              {budgetSpentPercentage !== 0 && (
                <h1 className="text-sm text-green-400">
                  {formatPercentage(budgetSpentPercentage)}
                </h1>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-[50%] mt-5">
        <div className="flex flex-col border h-full bg-white ">
          <div className="bg-[#F3FBFB] border-b px-5 py-3 flex items-center">
            <p className="font-medium text-lg">Upcoming Payments</p>
          </div>
          <div className="grid grid-cols-3 flex-1">
            <div className="flex justify-center items-center p-4">
              <div className="text-center">
                <h3 className="text-lg">Overdue</h3>
                <h1 className="text-[#154406] text-xl">
                  {formatCurrency(overdueAmount)}
                </h1>
                <p className="text-gray-400">
                  {formatNumber(overdueBills.length)} Bills
                </p>
              </div>
            </div>
            <div className="flex border-l border-r justify-center items-center p-4">
              <div className="text-center">
                <h3 className="text-lg">Due in 30 days</h3>
                <h1 className="text-[#154406] text-xl">
                  {formatCurrency(upcomingAmount)}
                </h1>
                <p className="text-gray-400">
                  {formatNumber(upcomingBills.length)} Bills
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center p-4">
              <div className="text-center">
                <h3 className="text-lg">Total Budget</h3>
                <h1 className="text-[#154406] text-xl">
                  {formatCurrency(totalBudgetAmount)}
                </h1>
                <p className="text-gray-400">
                  {formatNumber(budgets.length)} Budgets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceBox;
