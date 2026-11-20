'use client';
import React from 'react';
import Button from '@potta/components/button';
import CreateBudgetModal from '../../dashboard/components/createBudgetModal';
import { RiFilter3Line, RiCalendar2Line } from 'react-icons/ri';
import DynamicFilter from '@potta/components/dynamic-filter';

interface FilterProps {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
}

const Filter = ({
  search,
  setSearch,
  status,
  setStatus,
  date,
  setDate,
}: FilterProps) => {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false);

  const handleCreateBudget = (budgetData: {
    name: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    organizationId: string;
    branchId: string;
    policies: string[];
    recurrenceType?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
  }) => {
    // Here you would typically save the budget data to your backend
    console.log('Budget created:', budgetData);
    // You can add API call here to save the budget
  };

  const filterConfigs = [
    {
      key: 'status',
      icon: <RiFilter3Line className="text-gray-400 text-lg" />,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
      ],
      value: status,
      onChange: setStatus,
    },
    {
      key: 'date',
      icon: <RiCalendar2Line className="text-gray-400 text-lg" />,
      options: [
        { label: 'All Time', value: 'All Time' },
        { label: 'Yesterday', value: 'Yesterday' },
        { label: 'Last 7 Days', value: 'Last 7 Days' },
        { label: 'Last 30 Days', value: 'Last 30 Days' },
      ],
      value: date,
      onChange: setDate,
    },
  ];

  return (
    <>
      <div className="flex flex-col w-full md:flex-row md:items-center md:justify-between gap-4 my-4 mt-0">
        <DynamicFilter
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search budgets..."
          filters={filterConfigs}
        />
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            type={'button'}
            color
            text="Export"
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
          />
          <Button
            type={'button'}
            text="Create Budget"
            icon={<i className="ri-file-add-line"></i>}
            theme="default"
            onClick={() => setIsBudgetModalOpen(true)}
          />
        </div>
      </div>
      {/* Budget Creation Modal */}
      <CreateBudgetModal
        open={isBudgetModalOpen}
        setOpen={setIsBudgetModalOpen}
        onSave={handleCreateBudget}
      />
    </>
  );
};

export default Filter;
