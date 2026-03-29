// src/app/dashboard/page.tsx (or your desired route)
'use client';

import * as React from 'react';

import {
  Search,
  Upload,
  Calendar,
  LayoutGrid,
  List,
  FileText,
} from 'lucide-react';
import { mockBudget, mockPaymentRequests, mockTeam } from './utils/data';
import { BudgetCard } from '../component/budgetCard';
import { TerminalsCard } from './components/terminalCard';
import { TeamCard } from './components/teamCard';
import Input from '@potta/components/input';
import { Button } from '@potta/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { PaymentRequestDataTableWrapper } from './components/table';
import Filter from './components/filters';
import RootLayout from '../../../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
// Import your components and data

// Import the NEW Table Wrapper Component

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false); // Example loading state
  const context = React.useContext(ContextData);
  // Basic filtering example (can be expanded)
  const filteredRequests = mockPaymentRequests.filter(
    (req) =>
      req.madeBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.madeTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Example: Simulate loading (replace with actual API call)
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); // Simulate 1 second load
    return () => clearTimeout(timer);
  }, []);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } bg-gray-50  pr-5 w-full pt-6`}
      >
        {/* Top Row Cards (same as before) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6">
          <div className="col-span-2">
            <BudgetCard budget={mockBudget} />
          </div>
          <TerminalsCard count={9} />
          <TeamCard teamMembers={mockTeam} />
        </div>

        {/* Action/Filter Row (same as before) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8">
          {/* Search and Filters */}
          <Filter />
        </div>

        {/* Payment Request Table - USE THE NEW WRAPPER */}
        <div>
          <PaymentRequestDataTableWrapper
            requests={filteredRequests}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RootLayout>
  );
}
