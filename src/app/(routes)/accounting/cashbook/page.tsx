'use client';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import CashbookTable from './components/CashbookTable';

const CashbookPage = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Cashbook"
          description="Cash and bank movements (OHADA class 5) with automatic journal posting."
        />
        <Can
          resource="Cashbook"
          action="view"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view the cashbook.
            </p>
          }
        >
          <CashbookTable />
        </Can>
      </PageContainer>
    </RootLayout>
  );
};

export default CashbookPage;
