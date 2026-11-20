import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axios from 'config/axios.config';
import { DateRange } from 'react-day-picker';

interface ExpensesStats {
  total: {
    amount: number;
    count: number;
  };
  overdue: {
    amount: number;
    count: number;
    percentage: number;
  };
  upcoming: {
    amount: number;
    count: number;
    percentage: number;
  };
  paid: {
    amount: number;
    count: number;
    percentage: number;
  };
  pending: {
    amount: number;
    count: number;
    percentage: number;
  };
}

const useExpensesStats = (dateRange?: DateRange) => {
  const filter = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return {};

    return {
      fromDate: dateRange.from.toISOString(),
      toDate: dateRange.to.toISOString(),
    };
  }, [dateRange?.from?.toDateString(), dateRange?.to?.toDateString()]);

  const queryKey = useMemo(() => {
    return ['expenses-stats', filter];
  }, [filter]);

  const {
    data: billsData,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get('/bills', { params: filter });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = useMemo(() => {
    if (!billsData?.data) {
      return {
        total: { amount: 0, count: 0 },
        overdue: { amount: 0, count: 0, percentage: 0 },
        upcoming: { amount: 0, count: 0, percentage: 0 },
        paid: { amount: 0, count: 0, percentage: 0 },
        pending: { amount: 0, count: 0, percentage: 0 },
      };
    }

    const bills = billsData.data as any[];
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Filter bills by date range if provided
    let filteredBills = bills;
    if (dateRange?.from && dateRange?.to) {
      filteredBills = bills.filter((bill: any) => {
        if (!bill.createdAt) return false;
        const billDate = new Date(bill.createdAt);
        return billDate >= dateRange.from && billDate <= dateRange.to;
      });
    }

    const totalAmount = filteredBills.reduce((sum: number, bill: any) => {
      return sum + (parseFloat(bill.invoiceTotal) || 0);
    }, 0);

    const totalCount = filteredBills.length;

    const overdueBills = filteredBills.filter((bill: any) => {
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate < now && bill.status?.toUpperCase() !== 'PAID';
    });

    const upcomingBills = filteredBills.filter((bill: any) => {
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    });

    const paidBills = filteredBills.filter((bill: any) => {
      return bill.status?.toUpperCase() === 'PAID';
    });

    const pendingBills = filteredBills.filter((bill: any) => {
      return (
        bill.status?.toUpperCase() === 'PENDING' ||
        bill.status?.toUpperCase() === 'ISSUED'
      );
    });

    const overdueAmount = overdueBills.reduce((sum: number, bill: any) => {
      return sum + (parseFloat(bill.invoiceTotal) || 0);
    }, 0);

    const upcomingAmount = upcomingBills.reduce((sum: number, bill: any) => {
      return sum + (parseFloat(bill.invoiceTotal) || 0);
    }, 0);

    const paidAmount = paidBills.reduce((sum: number, bill: any) => {
      return sum + (parseFloat(bill.invoiceTotal) || 0);
    }, 0);

    const pendingAmount = pendingBills.reduce((sum: number, bill: any) => {
      return sum + (parseFloat(bill.invoiceTotal) || 0);
    }, 0);

    return {
      total: {
        amount: totalAmount,
        count: totalCount,
      },
      overdue: {
        amount: overdueAmount,
        count: overdueBills.length,
        percentage: totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0,
      },
      upcoming: {
        amount: upcomingAmount,
        count: upcomingBills.length,
        percentage: totalAmount > 0 ? (upcomingAmount / totalAmount) * 100 : 0,
      },
      paid: {
        amount: paidAmount,
        count: paidBills.length,
        percentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
      },
      pending: {
        amount: pendingAmount,
        count: pendingBills.length,
        percentage: totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0,
      },
    };
  }, [billsData, dateRange]);

  return {
    stats,
    isLoading,
    error,
  };
};

export default useExpensesStats;
