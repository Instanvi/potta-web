'use client';
import React, { useState, useContext } from 'react';
import { Shield, FileText, Car, CreditCard, Users, Building, Settings } from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import PolicyTable from './components/PolicyTable';
import PolicySidebar from './components/PolicySidebar';

// Policy categories structure
export const policyCategories = [
  { id: 'all', label: 'All Policies', icon: FileText },
  // {
  //   id: 'expense',
  //   label: 'Expense Policies',
  //   icon: CreditCard,
  //   submenus: [
  //     { id: 'reimbursement', label: 'Reimbursement', type: 'reimbursement' },
  //     { id: 'bills', label: 'Bills', type: 'bills' },
  //     { id: 'spend_requests', label: 'Spend Requests', type: 'spendRequests' },
  //   ],
  // },
  // {
  //   id: 'mileage',
  //   label: 'Mileage Policies',
  //   icon: Car,
  //   submenus: [
  //     { id: 'mileage_reimbursement', label: 'Mileage Reimbursement', type: 'mileage' },
  //     { id: 'travel_expenses', label: 'Travel Expenses', type: 'travel' },
  //   ],
  // },
  // {
  //   id: 'vendor',
  //   label: 'Vendor Policies',
  //   icon: Building,
  //   submenus: [
  //     { id: 'vendor_management', label: 'Vendor Management', type: 'vendors' },
  //     { id: 'vendor_approval', label: 'Vendor Approval', type: 'vendorApproval' },
  //   ],
  // },
  // {
  //   id: 'card',
  //   label: 'Card Policies',
  //   icon: CreditCard,
  //   submenus: [
  //     { id: 'corporate_cards', label: 'Corporate Cards', type: 'cards' },
  //     { id: 'card_limits', label: 'Card Limits', type: 'cardLimits' },
  //   ],
  // },
  {
    id: 'risk',
    label: 'Risk Policies',
    icon: Shield,
    // submenus: [
    //   { id: 'risk_management', label: 'Risk Management', type: 'risk' },
    //   { id: 'risk_approval', label: 'Risk Approval', type: 'riskApproval' },
    // ],
  },
  // {
  //   id: 'general',
  //   label: 'General Policies',
  //   icon: Settings,
  //   submenus: [
  //     { id: 'approval_workflows', label: 'Approval Workflows', type: 'approval' },
  //     { id: 'compliance', label: 'Compliance', type: 'compliance' },
  //   ],
  // },
];

export type PolicyCategoryId = 'all' | 'expense' | 'mileage' | 'vendor' | 'card' | 'general';

const PoliciesPage = () => {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState<PolicyCategoryId>('all');
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'} flex h-[92vh]`}>
      {/* Policy Sidebar */}
      <PolicySidebar
        policyCategories={policyCategories}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubmenuClick={setActiveSubmenu}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            {activeTab === 'all' ? 'All Policies' : 
             policyCategories.find(cat => cat.id === activeTab)?.label || 'Policies'}
          </h1>
          <p className="text-gray-600">
            Manage and configure your organization's policies and approval workflows
          </p>
        </div>

        {/* Policy Content */}
        <PolicyTable 
          activeTab={activeTab} 
          activeSubmenu={activeSubmenu}
        />
      </main>
    </div>
  );
};

export default PoliciesPage;
