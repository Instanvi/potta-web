'use client';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import TaxTable from './components/TaxTable';

const TaxesPage = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Taxes" description="Tax rates applied to items, receipts and invoices." />
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
