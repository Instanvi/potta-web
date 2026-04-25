import React from 'react';

import RootLayout from '@potta/app/(routes)/layout';
import TableComponents from '@potta/app/(routes)/vendors/components/table';

const VendorContent = () => {
  return (
   
      <div className="px-14 py-5">
        <div>
          <TableComponents />
        </div>
      </div>

  );
};
export default VendorContent;