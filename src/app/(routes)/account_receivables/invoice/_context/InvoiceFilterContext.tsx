import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface InvoiceFilterContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const InvoiceFilterContext = createContext<
  InvoiceFilterContextType | undefined
>(undefined);

interface InvoiceFilterProviderProps {
  children: ReactNode;
}

export const InvoiceFilterProvider: React.FC<InvoiceFilterProviderProps> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  return (
    <InvoiceFilterContext.Provider
      value={{
        dateRange,
        setDateRange,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </InvoiceFilterContext.Provider>
  );
};

export const useInvoiceFilter = () => {
  const context = useContext(InvoiceFilterContext);
  if (context === undefined) {
    throw new Error(
      'useInvoiceFilter must be used within an InvoiceFilterProvider'
    );
  }
  return context;
};
