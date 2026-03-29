'use client';
import React from 'react';
import Boxes from '../../app/(routes)/customers/components/boxes';
import TableComponents from '../../app/(routes)/customers/components/table';
import { toast } from 'react-hot-toast';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';

const CustomerContent = () => {
  const context = useContext(ContextData);
  return (
    <div
      className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'} py-5`}
    >
      <div>
        <TableComponents />
      </div>
    </div>
  );
};

export default CustomerContent;
