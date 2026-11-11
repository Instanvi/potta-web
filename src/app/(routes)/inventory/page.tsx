'use client';
import RootLayout from '../layout';
import Filter from '../pos/inventory/components/filters';
import InventoryTable from '../pos/inventory/components/table';
import { PageContainer, PageHeader } from '../_shared/states';

export default function InventoryProductsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Products" description="Your items and stock levels. Create them here or sync them from Pay." />
        <Filter />
        <InventoryTable />
      </PageContainer>
    </RootLayout>
  );
}
