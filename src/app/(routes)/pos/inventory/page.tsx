'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import Filter from './components/filters';
import InventoryTable from './components/table';
import { InventoryProvider } from './_utils/context';
import CategoryManager from './components/CategoryManager';
import { PageContainer, PageHeader, Tabs } from '../../_shared/states';

type InventoryTab = 'inventory' | 'category';

const TABS: { id: InventoryTab; label: string }[] = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'category', label: 'Category' },
];

const Files = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('inventory');
  return (
    <InventoryProvider>
      <RootLayout>
        <PageContainer>
          <PageHeader
            title="Inventory"
            description="Products synced from Pay, their stock levels and product categories."
          />
          <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
          {activeTab === 'inventory' ? (
            <>
              <Filter />
              <InventoryTable />
            </>
          ) : (
            <CategoryManager />
          )}
        </PageContainer>
      </RootLayout>
    </InventoryProvider>
  );
};
export default Files;
