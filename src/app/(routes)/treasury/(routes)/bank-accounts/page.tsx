'use client';
import React, { useEffect, useState } from 'react';
import BankAccountCard from './components/BankAccountCard';
import BankAccountCardSkeleton from './components/BankAccountCardSkeleton';
import BankAccountsFilter from './components/filters';
import CustomDeleteModal from './components/DeleteModal';
import { useGetBankAccounts } from './hooks/useGetBankAccounts';
import { useDeleteBankAccount } from './hooks/useDeleteBankAccount';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import RootLayout from '@potta/app/(routes)/layout';

const PAGE_SIZE = 8;

const BankAccountsPage = () => {
  const { data, isLoading, isError } = useGetBankAccounts();

  const [accounts, setAccounts] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteAccount = useDeleteBankAccount();
  const router = useRouter();

  // Tabs and pagination state
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setAccounts(data?.data);
  }, [data]);

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
        router.push('/bank-accounts');
      },
      onError: (error) => {
        toast.error('Failed to delete bank account, please try again later.');
      },
    });
  };

  // Filter accounts by tab
  const filteredAccounts = Array.isArray(accounts)
    ? accounts.filter((acc: any) =>
        activeTab === 'active' ? acc.is_active : !acc.is_active
      )
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE) || 1;
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when tab changes or accounts change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, accounts]);

  return (
    <RootLayout>
      <div className="pl-16 pr-5 mt-5">
        <BankAccountsFilter />

        {/* Tabs */}
        <div className="w-[30%] flex mb-6">
          <div
            onClick={() => setActiveTab('active')}
            className={`w-full h-12 flex justify-center cursor-pointer items-center bg-[#F3FBFB] ${
              activeTab === 'active' &&
              'border-b-2 border-[#154406] text-[#154406] font-medium'
            }`}
          >
            <p>Active Accounts</p>
          </div>
          <div
            onClick={() => setActiveTab('inactive')}
            className={`w-full h-12 flex justify-center cursor-pointer items-center bg-[#F3FBFB] ${
              activeTab === 'inactive' &&
              'border-b-2 border-[#154406] text-[#154406] font-medium'
            }`}
          >
            <p>Inactive Accounts</p>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading && (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <BankAccountCardSkeleton key={index} />
              ))}
            </>
          )}
          {isError && (
            <div className="text-red-500">Failed to load accounts.</div>
          )}
          {paginatedAccounts.length === 0 && !isLoading && !isError && (
            <div>No accounts found.</div>
          )}
          {paginatedAccounts.map((account: any) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="py-2 px-4 border rounded">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
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
      </div>
    </RootLayout>
  );
};
export default BankAccountsPage;
