'use client';
import RootLayout from '../../layout';
import ReturnsManager from '../../pos/inventory/components/stock-movements/ReturnsManager';
import { PageContainer } from '../../_shared/states';

export default function InventoryReturnsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <ReturnsManager />
      </PageContainer>
    </RootLayout>
  );
}
