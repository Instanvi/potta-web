'use client';
import React, { useState } from 'react';
import TerminalDatatable from '../../app/(routes)/inbox/components/terminalTable';
import BillDatatable from '../../app/(routes)/inbox/components/billTable';
import ReimbusementDatatable from '../../app/(routes)/inbox/components/reimburesmentTable';
import Terminalstable from '../../app/(routes)/inbox/components/terminal';
import { ContextData } from '@potta/components/providers/DataProvider';
const InboxContent = () => {
  const context = React.useContext(ContextData);
  const [active, setActive] = useState('Transaction');
  return (
    <div
      className={`${
        context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
      } pr-5`}
    >
      <div className="flex mt-10 w-fit bg-[#f3fbfb] pt-1">
        <div
          onClick={() => setActive('Transaction')}
          className={`px-4 flex justify-center cursor-pointer py-2 ${
            active == 'Transaction'
              ? 'text-[#154406] border-b-2 border-[#154406]'
              : ''
          }`}
        >
          <div className="flex space-x-3">
            <p>Transaction</p>
            <div
              className={`h-6 w-6 rounded-full flex justify-center items-center text-sm ${
                active == 'Transaction'
                  ? 'text-white bg-green-900'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              05
            </div>
          </div>
        </div>
        <div
          onClick={() => setActive('Bills')}
          className={`px-16 flex justify-center cursor-pointer py-2 ${
            active == 'Bills'
              ? 'text-[#154406] border-b-2 border-[#154406]'
              : ''
          }`}
        >
          <div className="flex space-x-3">
            <p>Bills</p>
            <div
              className={`h-6 w-6 rounded-full flex justify-center items-center text-sm ${
                active == 'Bills'
                  ? 'text-white bg-green-900'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              05
            </div>
          </div>
        </div>
        <div
          onClick={() => setActive('Reimbursement')}
          className={`px-8 flex justify-center cursor-pointer py-2 ${
            active == 'Reimbursement'
              ? 'text-[#154406] border-b-2 border-[#154406]'
              : ''
          }`}
        >
          <div className="flex space-x-3">
            <p>Reimbursement</p>
            <div
              className={`h-6 w-6 rounded-full flex justify-center items-center text-sm ${
                active == 'Reimbursement'
                  ? 'text-white bg-green-900'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              05
            </div>
          </div>
        </div>
        <div
          onClick={() => setActive('Terminals')}
          className={`px-12 flex justify-center cursor-pointer py-2 ${
            active == 'Terminals'
              ? 'text-[#154406] border-b-2 border-[#154406]'
              : ''
          }`}
        >
          <div className="flex space-x-3">
            <p>Terminals</p>
            <div
              className={`h-6 w-6 rounded-full flex justify-center items-center text-sm ${
                active == 'Terminals'
                  ? 'text-white bg-green-900'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              05
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        {active === 'Transaction' && <TerminalDatatable />}
        {active === 'Bills' && <BillDatatable />}
        {active === 'Reimbursement' && <ReimbusementDatatable />}
        {active === 'Terminals' && <Terminalstable />}
      </div>
    </div>
  );
};

export default InboxContent;
