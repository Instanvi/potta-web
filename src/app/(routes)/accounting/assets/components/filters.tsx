import React, { useState } from 'react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { Plus } from 'lucide-react';
import AddAssetSlideover from './AddAssetSlideover';

const AssetFilters = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="w-full mb-4 flex items-center justify-between">
      <div className="flex space-x-2 w-[50%]">
        <div className="w-1/2">
          <Search placeholder="Search assets..." />
        </div>
      </div>

      <AddAssetSlideover open={isCreateOpen} setOpen={setIsCreateOpen} />
    </div>
  );
};

export default AssetFilters;
