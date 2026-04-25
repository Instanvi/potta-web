import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';
import { IFilter } from '../_utils/types';

interface InvoiceStats {
  paid: {
    count: number;
    amount: number;
    percentage: number;
  };
  pendingApproval: {
    count: number;
    amount: number;
    percentage: number;
  };
  accepted: {
    count: number;
    amount: number;
    percentage: number;
  };
  outstanding: {
    count: number;
    amount: number;
    percentage: number;
  };
}

const useInvoiceStats = (dateRange?: { from: Date; to: Date }) => {
  // Memoize the filter object to prevent unnecessary re-renders
  const filter: IFilter = useMemo(
    () => ({
      limit: 1000, // Get all invoices for stats calculation
      page: 1,
      sortOrder: 'DESC',
      sortBy: 'createdAt',
    }),
    []
  );

  // Create a stable query key that doesn't change on every render
  const queryKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return ['get-all-invoicing-stats'];
    }
    // Use date strings instead of Date objects to ensure stability
    const fromStr = dateRange.from.toDateString();
    const toStr = dateRange.to.toDateString();
    return ['get-all-invoicing-stats', fromStr, toStr];
  }, [dateRange?.from?.toDateString(), dateRange?.to?.toDateString()]);

  const {
    data: invoicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => invoiceApi.getAll(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
  });

  const stats = useMemo(() => {
    if (!invoicesData?.data) {
      return {
        paid: { count: 0, amount: 0, percentage: 0 },
        pendingApproval: { count: 0, amount: 0, percentage: 0 },
        accepted: { count: 0, amount: 0, percentage: 0 },
        outstanding: { count: 0, amount: 0, percentage: 0 },
      };
    }

    const invoices = invoicesData.data as any[];
    console.log('invoices', invoices);

    // Filter by date range if provided
    let filteredInvoices = invoices;
    if (dateRange?.from && dateRange?.to) {
      filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.issuedDate);

        // Create date objects for comparison (ignore time)
        const invoiceDateOnly = new Date(
          invoiceDate.getFullYear(),
          invoiceDate.getMonth(),
          invoiceDate.getDate()
        );
        const fromDateOnly = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate()
        );
        const toDateOnly = new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate()
        );

        console.log('Filtering invoice:', {
          invoiceId: invoice.invoiceId,
          issuedDate: invoice.issuedDate,
          invoiceDateOnly: invoiceDateOnly.toISOString(),
          fromDateOnly: fromDateOnly.toISOString(),
          toDateOnly: toDateOnly.toISOString(),
          isInRange:
            invoiceDateOnly >= fromDateOnly && invoiceDateOnly <= toDateOnly,
        });

        return invoiceDateOnly >= fromDateOnly && invoiceDateOnly <= toDateOnly;
      });
    }

    const totalInvoices = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce(
      (sum: number, invoice: any) => sum + (invoice.invoiceTotal || 0),
      0
    );

    // Calculate stats by status - using actual API statuses
    const paidInvoices = filteredInvoices.filter(
      (invoice: any) => invoice.status?.toUpperCase() === 'PAID'
    );

    // Pending Approval = ISSUED (invoices that are issued but not yet approved/paid)
    const pendingApprovalInvoices = filteredInvoices.filter(
      (invoice: any) => invoice.status?.toUpperCase() === 'ISSUED'
    );

    // Accepted = APPROVED (invoices that are approved)
    const acceptedInvoices = filteredInvoices.filter(
      (invoice: any) => invoice.status?.toUpperCase() === 'APPROVED'
    );

    // Outstanding = OVERDUE (invoices that are overdue)
    const outstandingInvoices = filteredInvoices.filter(
      (invoice: any) => invoice.status?.toUpperCase() === 'OVERDUE'
    );

    const paidAmount = paidInvoices.reduce(
      (sum: number, invoice: any) => sum + (invoice.invoiceTotal || 0),
      0
    );
    const pendingApprovalAmount = pendingApprovalInvoices.reduce(
      (sum: number, invoice: any) => sum + (invoice.invoiceTotal || 0),
      0
    );
    const acceptedAmount = acceptedInvoices.reduce(
      (sum: number, invoice: any) => sum + (invoice.invoiceTotal || 0),
      0
    );
    const outstandingAmount = outstandingInvoices.reduce(
      (sum: number, invoice: any) => sum + (invoice.invoiceTotal || 0),
      0
    );

    return {
      paid: {
        count: paidInvoices.length,
        amount: paidAmount,
        percentage:
          totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0,
      },
      pendingApproval: {
        count: pendingApprovalInvoices.length,
        amount: pendingApprovalAmount,
        percentage:
          totalInvoices > 0
            ? (pendingApprovalInvoices.length / totalInvoices) * 100
            : 0,
      },
      accepted: {
        count: acceptedInvoices.length,
        amount: acceptedAmount,
        percentage:
          totalInvoices > 0
            ? (acceptedInvoices.length / totalInvoices) * 100
            : 0,
      },
      outstanding: {
        count: outstandingInvoices.length,
        amount: outstandingAmount,
        percentage:
          totalInvoices > 0
            ? (outstandingInvoices.length / totalInvoices) * 100
            : 0,
      },
    };
  }, [invoicesData, dateRange]);

  return {
    stats,
    isLoading,
    error,
  };
};

export default useInvoiceStats;
