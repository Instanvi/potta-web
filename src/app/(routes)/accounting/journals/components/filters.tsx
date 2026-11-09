'use client';
import React, { useState } from 'react';
import Search from '@potta/components/search';
import { Can } from '@/components/auth/can';
import JournalSlider from './journalSlider';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const Filter = ({ search, onSearchChange }: FilterProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="mb-4 flex w-full items-center justify-between gap-3">
      <Search
        placeholder="Search entries"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        className="w-full sm:max-w-xs"
      />

      <Can resource="JournalEntries" action="create">
        <JournalSlider open={isCreateOpen} setOpen={setIsCreateOpen} />
      </Can>
    </div>
  );
};

export default Filter;
