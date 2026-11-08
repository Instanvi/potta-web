'use client';
import { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import RootLayout from '../../layout';
import CreditNotesView from './components/CreditNotesView';

const CreditNotesPage = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6`}
      >
        <CreditNotesView />
      </div>
    </RootLayout>
  );
};

export default CreditNotesPage;
