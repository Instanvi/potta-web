'use client';
import { useState } from 'react';
import RootLayout from '../layout';
import Filter from '../pos/inventory/components/filters';
import InventoryTable from '../pos/inventory/components/table';
import { PageContainer } from '../_shared/states';
import type { Product } from '../pos/inventory/_utils/types';

export default function InventoryProductsPage() {
  const [exportRows, setExportRows] = useState<Product[]>([]);

  return (
    <RootLayout>
      <PageContainer>
        <Filter rows={exportRows} />
        <InventoryTable onRowsChange={setExportRows} />
      </PageContainer>
    </RootLayout>
  );
}
