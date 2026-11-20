'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import React, { useState } from 'react';
import AddBankAccountSlideover from './AddBankAccountSlideover';
import { ListToolbar } from '../../../../_shared/states';
import { ExportButton } from '@/components/export-button';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  rows?: Array<{
    bank_name?: string;
    account_name?: string;
    account_type?: string;
    account_number?: string;
    card_number?: string;
    currency?: string;
    current_balance?: number | string;
  }>;
}

const Filter: React.FC<FilterProps> = ({ search, onSearchChange, rows = [] }) => {
  const [slideoverOpen, setSlideoverOpen] = useState(false);

  return (
    <>
      <ListToolbar
        actions={
          <>
            <ExportButton
              filename="bank-accounts"
              rows={rows}
              columns={[
                { key: 'bank_name', header: 'Bank' },
                { key: 'account_name', header: 'Account name' },
                { key: 'account_type', header: 'Type' },
                {
                  key: 'account_number',
                  header: 'Number',
                  value: (row) =>
                    row.account_type === 'Bank_Account'
                      ? row.account_number ?? ''
                      : row.card_number ?? '',
                },
                { key: 'currency', header: 'Currency' },
                { key: 'current_balance', header: 'Balance' },
              ]}
            />
            <Button
              type={'button'}
              text="Add Bank Account"
              icon={<i className="ri-file-add-line"></i>}
              theme="default"
              onClick={() => setSlideoverOpen(true)}
            />
          </>
        }
      >
        <Search
          placeholder="Search by bank name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </ListToolbar>
      <AddBankAccountSlideover open={slideoverOpen} setOpen={setSlideoverOpen} />
    </>
  );
};

export default Filter;
