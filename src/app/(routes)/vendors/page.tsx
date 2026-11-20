import React from 'react';

import Boxes from './components/boxes';
import TableComponents from './components/table';
import RootLayout from '../layout';

const Vendors = () => {
  return (
    <RootLayout>
      <div className="px-14 py-5">
        <div>
          <Boxes />
        </div>
        <div>
          <TableComponents />
        </div>
      </div>
    </RootLayout>
  );
};
export default Vendors;
