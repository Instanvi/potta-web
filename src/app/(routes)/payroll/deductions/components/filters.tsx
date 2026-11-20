import React, { useState } from 'react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import AddDeductionSlideover from './AddDeductionSlideover';

const DeductionFilters = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="w-full flex mb-2 items-center justify-between">
      <div className="flex space-x-2 w-[50%]">
        <div className="w-1/2">
          <Search placeholder="Search deductions..." />
        </div>
      </div>
      <AddDeductionSlideover open={isCreateOpen} setOpen={setIsCreateOpen} />
  </div>
  );
};

export default DeductionFilters;
