'use client';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import TaxTable from './components/TaxTable';

const TaxesPage = () => {
  return (
    <RootLayout>
      <PageContainer>
        
        <Can
          resource="Tax"
          action="view-all"
          fallback={
            <p className="text-sm text-muted-foreground">You do not have permission to view taxes.</p>
          }
        >
          <TaxTable />
        </Can>
      </PageContainer>
    </RootLayout>
  );
};

export default TaxesPage;
