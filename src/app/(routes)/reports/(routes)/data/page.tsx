'use client';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext, useState, useEffect } from 'react';
import { dataMenu } from './components/dataMenu';
import Sidebar from '../../components/Sidebar';
import RootLayout from '@potta/app/(routes)/layout';
import DataTableDynamic from './components/DataTableDynamic';

// Example: Add table data for each submenu here
const dataTables = {
  ar_turnover: [
    { date: '2024-06-01', ratio: 5.2, notes: 'Above average' },
    { date: '2024-06-02', ratio: 4.8, notes: 'Slightly down' },
    { date: '2024-06-03', ratio: 5.0, notes: 'Stable' },
  ],
  ap_aging: [
    { bucket: '0-30d', amount: 12000 },
    { bucket: '31-60d', amount: 8000 },
    { bucket: '61-90d', amount: 4000 },
    { bucket: '90d+', amount: 2000 },
  ],
  headcount: [
    { month: 'Jan', count: 50 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 54 },
  ],
  sales_performance: [
    { quarter: 'Q1', deals: 120, revenue: 50000 },
    { quarter: 'Q2', deals: 130, revenue: 52000 },
  ],
};

const Page: React.FC = () => {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState(dataMenu[0].id);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const activeMenu = dataMenu.find((cat) => cat.id === activeTab);
  const submenus = activeMenu?.submenus || [];

  // Show the first submenu's table by default if there are submenus
  useEffect(() => {
    if (submenus.length > 0) {
      setActiveSubmenu(submenus[0].id);
    } else {
      setActiveSubmenu(null);
    }
  }, [activeTab]);

  // Find the label for the current table
  let tableLabel = '';
  if (submenus.length > 0 && activeSubmenu) {
    const submenu = submenus.find((s) => s.id === activeSubmenu);
    tableLabel = submenu ? submenu.label : '';
  } else if (submenus.length === 0) {
    tableLabel = activeMenu?.label || '';
  }

  const showTableId =
    activeSubmenu || (submenus.length === 0 ? activeTab : null);

  return (
    <RootLayout>
      <div
        className={`pl-8 flex h-[92vh]`}
      >
        {/* Vertical Sidebar */}
        <Sidebar
          reportCategories={dataMenu}
          activeTab={activeTab}
          setActiveTab={(id) => {
            setActiveTab(id as any);
            // activeSubmenu will be set by useEffect
          }}
          onSubmenuClick={(submenuId: string) => setActiveSubmenu(submenuId)}
        />
        {/* Main Content */}
        <main className="flex-1 px-4 py-4 overflow-y-auto h-full">
          {tableLabel && (
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tableLabel}
            </h2>
          )}
          {showTableId && dataTables[showTableId] && (
            <DataTableDynamic data={dataTables[showTableId]} />
          )}
        </main>
      </div>
    </RootLayout>
  );
};

export default Page;
