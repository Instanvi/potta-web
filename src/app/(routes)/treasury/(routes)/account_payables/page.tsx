'use client';
import React, { useState, useContext, useEffect } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import RootLayout from '../../../layout';
import TreasurySidebar from '../../components/TreasurySidebar';
import TreasuryOverview from '../../components/TreasuryOverview';
import VendorInvoicesTable from '../../components/VendorInvoicesTable';
import CreditNotesTable from '../../components/CreditNotesTable';
import PaidInvoicesTable from '../../components/PaidInvoicesTable';
import ExpenseClaimsTable from '../../components/ExpenseClaimsTable';
import VendorsTable from '../../components/VendorsTable';

const AccountPayablesPage = () => {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmenu, setSelectedSubmenu] = useState<string | null>(null);

  // Define the menu structure to know which items have submenus
  const menuStructure = {
    purchases: {
      id: 'purchases',
      submenus: ['vendor_invoices', 'credit_notes'],
    },
    vendors: {
      id: 'vendors',
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
      return <TreasuryOverview type="ap" />;
    }

    if (selectedSubmenu === 'vendor_invoices') {
      return (
        <div className="p-3">
          <VendorInvoicesTable />
        </div>
      );
    }

    if (selectedSubmenu === 'credit_notes') {
      return (
        <div className="p-3">
          <CreditNotesTable />
        </div>
      );
    }

    if (activeTab === 'payments') {
      return (
        <div className="p-3">
          <PaidInvoicesTable />
        </div>
      );
    }

    if (activeTab === 'expense_claims') {
      return (
        <div className="p-3">
          <ExpenseClaimsTable />
        </div>
      );
    }

    if (activeTab === 'vendors') {
      return (
        <div className="p-3">
          <VendorsTable />
        </div>
      );
    }
    if (selectedSubmenu) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-medium mb-4 text-gray-900">
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
        <h2 className="text-2xl font-medium mb-4 text-gray-900">
          Account Payables
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
          type="ap"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto ">
          {renderContent()}
        </main>
      </div>
    </RootLayout>
  );
};

export default AccountPayablesPage;
