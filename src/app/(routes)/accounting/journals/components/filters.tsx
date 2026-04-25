'use client';
import React, { useState } from 'react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { Plus } from 'lucide-react';
import JournalSlider from './journalSlider';

const Filter = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="w-full mb-4 flex items-center justify-between">
      <div className="flex space-x-2 w-[50%]">
        <div className="w-1/2">
          <Search />
        </div>
      </div>

      <JournalSlider open={isCreateOpen} setOpen={setIsCreateOpen} />
    </div>
  );
};

export default Filter;
