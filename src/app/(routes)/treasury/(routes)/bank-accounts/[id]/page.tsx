'use client';
import React, { useState } from 'react';
import RootLayout from '@potta/app/(routes)/layout';
import BankAccountCard from '../components/BankAccountCard';
import BankAccountTable from '../components/BankAccountTable';
import { useParams } from 'next/navigation';
import { useGetBankAccount } from '../hooks/useGetBankAccount';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import BankAccountDetailsWideCard from '../components/BankAccountDetailsWideCard';
import { useDeactivateBankAccount } from '../hooks/useDeactivateBankAccount';
import toast from 'react-hot-toast';
import { ContextData } from '@potta/components/providers/DataProvider';

const BankAccountDetailsPage = () => {
  const params = useParams();
  const accountId = params.id as string;
  const { data: account, isLoading, isError } = useGetBankAccount(accountId);
  const context = React.useContext(ContextData);
  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('All Time');

  // Extract ledger_account_id from account
  const ledgerAccountId = account?.ledger_account_id;

  const deactivateAccount = useDeactivateBankAccount();

  // Handler for deactivation
  const handleDeactivate = (id: string) => {
    deactivateAccount.mutate(id, {
      onSuccess: () => {
        toast.success('Bank account deactivated successfully!');
      },
      onError: () => {
        toast.error(
          'Failed to deactivate bank account, please try again later.'
        );
      },
    });
  };

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } pr-5 w-full pt-6`}
      >
        {/* Top Card */}
        <div className="w-full mb-6">
          <BankAccountDetailsWideCard
            account={account}
            loading={isLoading}
            onDelete={handleDeactivate}
            deactivating={deactivateAccount.isPending}
          />
        </div>
        {/* Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex space-x-2 w-[50%]">
            <div className="w-[50%]">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex w-[50%] space-x-2">
              <div className="flex items-center gap-2 ">
                <label className="text-sm font-medium whitespace-nowrap">
                  Filter:
                </label>
                <Select
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Dormant', value: 'dormant' },
                  ]}
                  selectedValue={status}
                  onChange={setStatus}
                  bg=""
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  Date:
                </label>
                <Select
                  options={[
                    { label: 'All Time', value: 'All Time' },
                    { label: 'Yesterday', value: 'Yesterday' },
                    { label: 'Last 7 Days', value: 'Last 7 Days' },
                    { label: 'Last 30 Days', value: 'Last 30 Days' },
                  ]}
                  selectedValue={dateRange}
                  onChange={setDateRange}
                  bg=""
                />
              </div>
            </div>
          </div>
          <div className="w-[30%] flex justify-end">
            {/* Export button or other actions can go here */}
          </div>
        </div>
        {/* Transactions Table */}
        <div>
          {ledgerAccountId ? (
            <BankAccountTable
              ledgerAccountId={ledgerAccountId}
              search={search}
              status={status}
              dateRange={dateRange}
            />
          ) : isLoading ? null : (
            <div className="text-gray-500">
              No ledger account found for this bank account.
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
};

export default BankAccountDetailsPage;
