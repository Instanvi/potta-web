'use client';
import React, { useState } from 'react';
import RootLayout from '@potta/app/(routes)/layout';
import BankAccountTable from '../components/BankAccountTable';
import { useParams } from 'next/navigation';
import { useGetBankAccount } from '../hooks/useGetBankAccount';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import BankAccountDetailsWideCard from '../components/BankAccountDetailsWideCard';
import { useDeactivateBankAccount } from '../hooks/useDeactivateBankAccount';
import { toast } from 'sonner';
import { ListToolbar, PageContainer, PageHeader } from '../../../../_shared/states';

const BankAccountDetailsPage = () => {
  const params = useParams();
  const accountId = params.id as string;
  const { data: account, isLoading } = useGetBankAccount(accountId);
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
      <PageContainer>
        <PageHeader
          title={account?.account_name || account?.bank_name || 'Bank account'}
          description="Account details and the ledger transactions posted to it."
        />
        <div className="mb-6 w-full">
          <BankAccountDetailsWideCard
            account={account}
            loading={isLoading}
            onDelete={handleDeactivate}
            deactivating={deactivateAccount.isPending}
          />
        </div>
        <ListToolbar>
          <Search
            placeholder="Search description or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium">Filter:</label>
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
            <label className="whitespace-nowrap text-sm font-medium">Date:</label>
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
        </ListToolbar>
        {ledgerAccountId ? (
          <BankAccountTable
            ledgerAccountId={ledgerAccountId}
            search={search}
            status={status}
            dateRange={dateRange}
          />
        ) : isLoading ? null : (
          <p className="text-sm text-muted-foreground">
            No ledger account found for this bank account.
          </p>
        )}
      </PageContainer>
    </RootLayout>
  );
};

export default BankAccountDetailsPage;
