'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import { Badge } from '@potta/components/shadcn/badge';
import Search from '@potta/components/search';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import Button from '@potta/components/button';
import NewSpendProgramSlideover from './components/NewSpendProgramSlideover';
import { ChevronDown, CreditCard, FileText } from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useQuery } from '@tanstack/react-query';
import { getSpendPrograms } from './utils/api';
import { Skeleton } from '@potta/components/shadcn/skeleton';
import { SpendProgram, SpendProgramType } from './utils/types';

const filterOptions = [
  { label: 'All programs', value: 'all' },
  { label: 'Card programs', value: 'CARD' },
  { label: 'Procurement programs', value: 'PROCUREMENT' },
];

// Helper function to get icon based on program type
const getProgramIcon = (type: SpendProgramType) => {
  switch (type) {
    case 'CARD':
      return <CreditCard className="w-6 h-6 text-green-600" />;
    case 'PROCUREMENT':
      return <FileText className="w-6 h-6 text-blue-600" />;
    default:
      return <FileText className="w-6 h-6 text-gray-600" />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SpendProgramPage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterOptions[0].value);
  const [filterLabel, setFilterLabel] = useState(filterOptions[0].label);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const context = React.useContext(ContextData);

  // Fetch spend programs from API
  const {
    data: spendPrograms = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['spend-programs'],
    queryFn: getSpendPrograms,
  });

  // Filter programs based on search and active filter
  const filteredPrograms = spendPrograms.filter((program: SpendProgram) => {
    const matchesSearch =
      program.name.toLowerCase().includes(search.toLowerCase()) ||
      program.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' || program.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-5'
        } pr-5 pt-2`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 ">
              <Search
                placeholder="search spend programs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-3 border  bg-white text-black text-sm flex items-center gap-2 min-w-[]">
                  {filterLabel}
                  <ChevronDown size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="!rounded-none min-w-[142px]"
              >
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setActiveFilter(option.value);
                      setFilterLabel(option.label);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <NewSpendProgramSlideover
              open={slideoverOpen}
              setOpen={setSlideoverOpen}
              onCreated={refetch}
            />
          </div>
        </div>
        {isLoading && (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            }}
          >
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 p-6 flex flex-col gap-4 rounded-md"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="bg-green-50 p-2 rounded w-10 h-10" />
                  <Skeleton className="h-6 w-32 flex-1" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center justify-between border-t pt-3 mt-2">
                  <Skeleton className="h-4 w-16 rounded-lg" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="ml-1 h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isError && (
          <div className="text-red-500">Failed to load programs.</div>
        )}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            // 3 per row on large screens, autofill on resize
          }}
        >
          {filteredPrograms.map((program: SpendProgram) => (
            <div
              key={program.id}
              className="bg-white border cursor-pointer border-gray-200 p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-50 p-2 rounded">
                  {getProgramIcon(program.type)}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 flex-1">
                  {program.name}
                </h2>
                <Badge
                  className={`${getStatusColor(
                    program.status
                  )} font-medium px-3 py-1 rounded-full text-xs`}
                >
                  {program.status}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mb-2">
                {program.description}
              </p>
              <div className="flex items-center justify-between border-t pt-3 mt-2">
                <span className="text-xs bg-[#F3FBFB] px-3 py-1 rounded-lg text-gray-700">
                  {program.unit}
                </span>
                <span className="flex cursor-pointer items-center gap-1 text-xs">
                  <span
                    className={`grid place-content-center text-center w-5 h-5 rounded-full text-white text-xs font-bold ${
                      program.purchaseOrders > 0
                        ? 'bg-green-900'
                        : 'bg-gray-300'
                    }`}
                  >
                    {program.purchaseOrders}
                  </span>
                  <span
                    className={`ml-1 ${
                      program.purchaseOrders > 0
                        ? 'text-green-900'
                        : 'text-gray-400'
                    }`}
                  >
                    Purchase Orders
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RootLayout>
  );
};

export default SpendProgramPage;
