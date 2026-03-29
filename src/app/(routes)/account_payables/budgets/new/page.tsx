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

import Filter from './components/filters';
import RootLayout from '../../../layout';
import { TeamCard } from './components/teamCard';
import PolicyEditor from './components/policyEditor';
import { ContextData } from '@potta/components/providers/DataProvider';

export default function DashboardPage() {
  const context = React.useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } bg-gray-100  pr-5 w-full pt-6`}
      >
        {/* Top Row Cards (same as before) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8">
          <div className="col-span-3">
            <BudgetCard budget={mockBudget} />
          </div>
          <TerminalsCard count={9} />
          <div className="col-span-2">
            <TeamCard teamMembers={mockTeam} />
          </div>
        </div>

        <div>
          <PolicyEditor />
        </div>
      </div>
    </RootLayout>
  );
}
