'use client';
import RootLayout from '../../layout';
import AdjustmentsManager from '../../pos/inventory/components/stock-movements/AdjustmentsManager';
import { PageContainer } from '../../_shared/states';

export default function InventoryAdjustmentsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <AdjustmentsManager />
      </PageContainer>
    </RootLayout>
  );
}
