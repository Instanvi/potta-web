'use client';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import CreditNotesView from './components/CreditNotesView';

const CreditNotesPage = () => (
  <RootLayout>
    <PageContainer>
      <CreditNotesView />
    </PageContainer>
  </RootLayout>
);

export default CreditNotesPage;
