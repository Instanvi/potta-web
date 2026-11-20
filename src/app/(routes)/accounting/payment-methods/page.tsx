'use client';

import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import PaymentMethodTable from './components/PaymentMethodTable';

const PaymentMethodsPage = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Payment methods"
          description="Defaults are seeded per organization. Add custom methods for sales receipts and POS."
        />
        <Can
          resource="PaymentMethod"
          action="view-all"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view payment methods.
            </p>
          }
        >
          <PaymentMethodTable />
        </Can>
      </PageContainer>
    </RootLayout>
  );
};

export default PaymentMethodsPage;
