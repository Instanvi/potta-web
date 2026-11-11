'use client';
import RootLayout from '../../layout';
import ReturnsManager from '../../pos/inventory/components/stock-movements/ReturnsManager';
import { PageContainer, PageHeader } from '../../_shared/states';

export default function InventoryReturnsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Returns"
          description="Items customers brought back. Processing a return puts the items back in stock when you choose to."
        />
        <ReturnsManager />
      </PageContainer>
    </RootLayout>
  );
}
