'use client';
import React, { useState, useContext, useEffect } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import RootLayout from '../../../layout';
import TreasurySidebar from '../../components/TreasurySidebar';
import TreasuryOverview from '../../components/TreasuryOverview';
import CustomerInvoicesTable from '../../components/CustomerInvoicesTable';
import PaidInvoicesTable from '../../components/PaidInvoicesTable';
import CustomersTable from '../../components/CustomersTable';

const AccountReceivablesPage = () => {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmenu, setSelectedSubmenu] = useState<string | null>(null);

  // Define the menu structure to know which items have submenus
  const menuStructure = {
    customer_invoices: {
      id: 'customer_invoices',
      submenus: [],
    },
    customers: {
      id: 'customers',
      submenus: [],
    },
  };

  const handleSubmenuClick = (submenuId: string) => {
    setSelectedSubmenu(submenuId);
    console.log('Selected submenu:', submenuId);
  };

  const handleMenuClick = (menuId: string) => {
    setActiveTab(menuId);

    // If the menu has submenus, automatically select the first one
    const menuItem = menuStructure[menuId as keyof typeof menuStructure];
    if (menuItem && menuItem.submenus.length > 0) {
      setSelectedSubmenu(menuItem.submenus[0]);
    } else {
      setSelectedSubmenu(null);
    }
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return <TreasuryOverview type="ar" />;
    }

    if (activeTab === 'customer_invoices') {
      return (
        <div className="p-3">
          <CustomerInvoicesTable />
        </div>
      );
    }

    if (activeTab === 'paid_invoices') {
      return (
        <div className="p-3">
          <PaidInvoicesTable />
        </div>
      );
    }

    if (activeTab === 'customers') {
      return (
        <div className="p-3">
          <CustomersTable />
        </div>
      );
    }

    if (selectedSubmenu) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            {selectedSubmenu
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </h2>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-gray-600">
              Content for {selectedSubmenu} will be displayed here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Account Receivables
        </h2>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-gray-600">
            Select a section from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } flex h-[92vh]`}
      >
        {/* Treasury Sidebar */}
        <TreasurySidebar
          activeTab={activeTab}
          setActiveTab={handleMenuClick}
          onSubmenuClick={handleSubmenuClick}
          type="ar"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto ">
          {renderContent()}
        </main>
      </div>
    </RootLayout>
  );
};

export default AccountReceivablesPage;
