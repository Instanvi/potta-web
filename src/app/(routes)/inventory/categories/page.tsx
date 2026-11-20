'use client';
import RootLayout from '../../layout';
import CategoryManager from '../../pos/inventory/components/CategoryManager';
import { PageContainer } from '../../_shared/states';

export default function InventoryCategoriesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <CategoryManager />
      </PageContainer>
    </RootLayout>
  );
}
