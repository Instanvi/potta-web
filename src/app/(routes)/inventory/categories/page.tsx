'use client';
import RootLayout from '../../layout';
import CategoryManager from '../../pos/inventory/components/CategoryManager';
import { PageContainer, PageHeader } from '../../_shared/states';

export default function InventoryCategoriesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Categories" description="Product categories used across POS, invoices and reports." />
        <CategoryManager />
      </PageContainer>
    </RootLayout>
  );
}
