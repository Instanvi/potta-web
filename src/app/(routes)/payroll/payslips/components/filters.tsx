import React, { useState } from 'react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import AddPayslipSlideover from './AddPayslipSlideover'; // To be implemented

const PayslipFilters = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex space-x-2 w-[50%]">
        <div className="w-1/2">
          <Search placeholder="Search payslips..." />
        </div>
      </div>
      <AddPayslipSlideover open={isCreateOpen} setOpen={setIsCreateOpen} />
    </div>
  );
};

export default PayslipFilters;
