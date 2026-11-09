'use client';
import React, { useEffect, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import BankAccountCard from './components/BankAccountCard';
import BankAccountCardSkeleton from './components/BankAccountCardSkeleton';
import BankAccountsFilter from './components/filters';
import CustomDeleteModal from './components/DeleteModal';
import { useGetBankAccounts } from './hooks/useGetBankAccounts';
import { useDeleteBankAccount } from './hooks/useDeleteBankAccount';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import RootLayout from '@potta/app/(routes)/layout';
import { DataTablePagination } from '@potta/components/ui/data-table-pagination';
import { useServerPagination } from '@/hooks/use-server-pagination';
import {
  EmptyState,
  ErrorState,
  PageContainer,
  PageHeader,
  Tabs,
} from '../../../_shared/states';

/** GET /bank-accounts always forces is_active=true, so inactive accounts cannot be listed yet. */
const TABS = [{ id: 'active' as const, label: 'Active accounts' }];

const BankAccountsPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active'>('active');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteAccount = useDeleteBankAccount();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { page, limit, tableProps } = useServerPagination({
    pageSize: 8,
    resetOn: [debouncedSearch],
  });

  const { data, isLoading, isError, error, refetch } = useGetBankAccounts({
    page,
    limit,
    sortBy: 'createdAt:DESC',
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const accounts: any[] = Array.isArray(data?.data) ? data.data : [];

  // Headless table so the card grid gets the standard DataTable pager.
  const pageProps = tableProps(data?.meta, accounts.length);
  const pager = useReactTable({
    data: accounts,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageProps.pageCount,
    onPaginationChange: pageProps.onPaginationChange,
    state: { pagination: pageProps.pagination },
  });

  // Handler to open delete modal from card
  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  // Handler to actually delete
  const handleDelete = () => {
    if (!deleteId) return;
    deleteAccount.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Bank account deleted successfully!');
        setDeleteOpen(false);
        setDeleteId(null);
        router.push('/treasury/bank-accounts');
      },
      onError: () => {
        toast.error('Failed to delete bank account, please try again later.');
      },
    });
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Bank accounts"
          description="Bank accounts and cards linked to your ledger, with their current balances."
        />
        <BankAccountsFilter search={search} onSearchChange={setSearch} />

        <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !isLoading && accounts.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? 'No accounts match this search' : 'No bank accounts yet'}
            description={
              debouncedSearch
                ? 'Clear the search to see all accounts.'
                : 'Add a bank account or card to track its balance and transactions.'
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: limit }).map((_, index) => (
                    <BankAccountCardSkeleton key={index} />
                  ))
                : accounts.map((account: any) => (
                    <BankAccountCard
                      key={account.uuid || account.account_number}
                      bankName={account.bank_name}
                      last4={
                        account.account_type === 'Bank_Account' &&
                        account.account_number
                          ? account.account_number.slice(-4)
                          : (account.account_type === 'Debit_Card' ||
                              account.account_type === 'Credit_Card') &&
                            account.card_number
                          ? account.card_number.slice(-4)
                          : undefined
                      }
                      balance={account.current_balance}
                      currency={account.currency}
                      id={account.uuid}
                      accountType={account.account_type}
                      cardType={account.card_type}
                      accountName={account.account_name}
                      onDelete={handleOpenDelete}
                    />
                  ))}
            </div>
            {!isLoading && (
              <div className="mt-6 dashboard-panel overflow-hidden">
                <DataTablePagination
                  table={pager}
                  pageSizeOptions={[8, 12, 24, 48]}
                  totalRowsOverride={pageProps.totalRows}
                />
              </div>
            )}
          </>
        )}

        {/* Custom Delete Modal rendered once at the root */}
        {deleteId && (
          <CustomDeleteModal
            accountId={deleteId}
            open={deleteOpen}
            setOpen={setDeleteOpen}
            onDelete={handleDelete}
          />
        )}
      </PageContainer>
    </RootLayout>
  );
};
export default BankAccountsPage;
