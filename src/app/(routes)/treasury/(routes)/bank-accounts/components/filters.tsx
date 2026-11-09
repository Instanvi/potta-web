'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import React, { useState } from 'react';
import AddBankAccountSlideover from './AddBankAccountSlideover';
import { ListToolbar } from '../../../../_shared/states';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ search, onSearchChange }) => {
  const [slideoverOpen, setSlideoverOpen] = useState(false);

  return (
    <>
      <ListToolbar
        actions={
          <>
            <Button
              type={'button'}
              color
              text="Export"
              icon={<img src="/images/export.svg" />}
              theme="lightBlue"
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
