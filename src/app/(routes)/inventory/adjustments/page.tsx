'use client';
import RootLayout from '../../layout';
import AdjustmentsManager from '../../pos/inventory/components/stock-movements/AdjustmentsManager';
import { PageContainer, PageHeader } from '../../_shared/states';

export default function InventoryAdjustmentsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Stock adjustments"
          description="Stock counts, damage, expiry and cost corrections. Every change to stock outside sales and restocks is recorded here."
        />
        <AdjustmentsManager />
      </PageContainer>
    </RootLayout>
  );
}
