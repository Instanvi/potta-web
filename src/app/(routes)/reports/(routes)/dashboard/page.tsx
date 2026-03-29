'use client';
import React, { useState, useEffect } from 'react';

import {
  pottaAnalyticsService,
  KpiCategory,
  KpiDefinition,
} from '../../../../../services/analyticsService';
import SearchableSelect from '../../../../../components/searchableSelect';
import RootLayout from '@potta/app/(routes)/layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import InventoryDashboard from './components/InventoryDashboard';
import ExpensesDashboard from './components/ExpensesDashboard';
import SalesDashboard from './components/SalesDashboard';
import CFODashboard from './components/CFODashboard';
import GeneralDashboard from './components/GeneralDashboard';
import BudgetingDashboard from './components/BudgetingDashboard';
import RevenueDashboard from './components/RevenueDashboard';
import InvestorDashboard from './components/InvestorDashboard';
import FinancialDashboard from './components/FinancialDashboard';
import HeadcountDashboard from './components/HeadcountDashboard';

const DashboardPage: React.FC = () => {
  const [availableKpis, setAvailableKpis] = useState<KpiDefinition[]>([]);
  const [kpiCategories, setKpiCategories] = useState<KpiCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [timeGranularity, setTimeGranularity] = useState<
    'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  >('monthly');

  // Define the specific dashboard tabs
  const dashboardTabs = [
    { id: 'general', name: 'General Dashboard' },
    { id: 'sales', name: 'Sales Dashboard' },
    { id: 'expenses', name: 'Expenses Dashboard' },
    { id: 'inventory', name: 'Inventory Dashboard' },
    { id: 'cfo', name: 'CFO Dashboard' },
    { id: 'budgeting', name: 'Budgeting and Forecasting' },
    { id: 'revenue', name: 'Revenue Planning' },
    { id: 'investor', name: 'Investor Reporting' },
    { id: 'financial', name: 'P&L, BS, CF' },
    { id: 'headcount', name: 'Headcount Planning' },
  ];

  // Load KPI data
  useEffect(() => {
    const loadKpiData = async () => {
      try {
        const [kpisResponse, categoriesResponse] = await Promise.all([
          pottaAnalyticsService.kpi.getAvailableKpis(),
          pottaAnalyticsService.kpi.getKpiCategories(),
        ]);

        setAvailableKpis(kpisResponse.kpis);
        setKpiCategories(categoriesResponse.categories);
      } catch (error) {
        console.error('Error loading KPI data:', error);
      }
    };

    loadKpiData();
  }, []);

  // Get KPIs for selected category
  const getKpisForCategory = (category: string) => {
    return availableKpis.filter((kpi) => kpi.category === category);
  };

  const context = React.useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`space-y-6  ${
          context?.layoutMode === 'sidebar' ? 'pl-10 ' : 'pl-5'
        } h-full pr-2 w-full`}
      >
        {/* Category Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        {activeTab !== 'general' && (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl w-full font-bold text-gray-900">
              {dashboardTabs.find((tab) => tab.id === activeTab)?.name}
            </h1>

            <div className="w-48">
              <SearchableSelect
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
                selectedValue={timeGranularity}
                onChange={(value) => setTimeGranularity(value as any)}
                placeholder="Select Time Period"
                labelClass="text-sm text-gray-700"
              />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {/* Conditional Dashboard Rendering */}
        {activeTab === 'general' ? (
          <GeneralDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'inventory' ? (
          <InventoryDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'expenses' ? (
          <ExpensesDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'sales' ? (
          <SalesDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'cfo' ? (
          <CFODashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'budgeting' ? (
          <BudgetingDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'revenue' ? (
          <RevenueDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'investor' ? (
          <InvestorDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'financial' ? (
          <FinancialDashboard timeGranularity={timeGranularity} />
        ) : activeTab === 'headcount' ? (
          <HeadcountDashboard timeGranularity={timeGranularity} />
        ) : (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Dashboard
              </h2>
              <p className="text-gray-600">Dashboard content coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

export default DashboardPage;
