'use client';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import CashbookTable from './components/CashbookTable';

const CashbookPage = () => {
  return (
    <RootLayout>
      <PageContainer>
        
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
