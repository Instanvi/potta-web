'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';

import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import { reportCategories, reportData } from './utils/dummyData';
import { ReportCategoryId, ReportCategory, Report } from './utils/types';
import { ContextData } from '@potta/components/providers/DataProvider';
import { reportCharts } from './components/DashboardSampleCards';
import ReportChartCard from './components/ReportChartCard';
import RootLayout from '../layout';
import ApiDebugTest from './analytics/ApiDebugTest';
import AnalyticsChartCard from './analytics/AnalyticsChartCard';
import KpiCard from './components/KpiCard';
import FPATabFilter from './components/FPATabFilter';
import {
  pottaAnalyticsService,
  KpiCategory,
  KpiDefinition,
} from '../../../services/analyticsService';
import SearchableSelect from '../../../components/searchableSelect';

const ReportsPage: React.FC = () => {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState<ReportCategory['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isGlobalSearch, setIsGlobalSearch] = useState(true); // Default to global search
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [initialOpenSubmenu, setInitialOpenSubmenu] = useState<
    string | undefined
  >(undefined);

  // FP&A Tab Filter State
  const [fpaActiveTab, setFpaActiveTab] = useState<
    'time' | 'geography' | 'orgcharts'
  >('time');
  const [timeCycleTab, setTimeCycleTab] = useState('Monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [selectedRegion, setSelectedRegion] = useState('North Region');
  const [selectedVillage, setSelectedVillage] = useState('Village A');
  const [selectedTown, setSelectedTown] = useState('Town A');
  const [selectedLocation, setSelectedLocation] = useState('Head Office');
  const [selectedDepartment, setSelectedDepartment] = useState('Finance');

  // KPI State
  const [availableKpis, setAvailableKpis] = useState<KpiDefinition[]>([]);
  const [kpiCategories, setKpiCategories] = useState<KpiCategory[]>([]);
  const [selectedKpiCategory, setSelectedKpiCategory] =
    useState<string>('financial');

  // Ensure selected category exists in available categories
  useEffect(() => {
    if (
      kpiCategories.length > 0 &&
      !kpiCategories.some((cat) => cat.name === selectedKpiCategory)
    ) {
      setSelectedKpiCategory(kpiCategories[0].name);
    }
  }, [kpiCategories, selectedKpiCategory]);

  // Get all reports
  const getAllReports = (): Report[] => {
    return Object.values(reportData).flat();
  };

  // Get reports for the active tab
  const getActiveReports = (): Report[] => {
    if (activeTab === 'all') {
      return getAllReports();
    }
    return [];
  };

  // Filter reports based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(getActiveReports());
      return;
    }

    const query = searchQuery.toLowerCase();

    // If global search is enabled, search across all reports
    const reportsToSearch = isGlobalSearch
      ? getAllReports()
      : getActiveReports();

    const filtered = reportsToSearch.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query)
    );

    setFilteredReports(filtered);
  }, [searchQuery, activeTab, isGlobalSearch]);

  // When tab changes and no search is active, reset filtered reports
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(getActiveReports());
    }
  }, [activeTab]);

  // Load KPI data
  useEffect(() => {
    const loadKpiData = async () => {
      try {
        const [kpisResponse, categoriesResponse] = await Promise.all([
          pottaAnalyticsService.kpi.getAvailableKpis(),
          pottaAnalyticsService.kpi.getKpiCategories(),
        ]);

        // Set the data from the API responses
        setAvailableKpis(kpisResponse.kpis || []);
        setKpiCategories(categoriesResponse.categories || []);
      } catch (error) {
        console.error('Error loading KPI data:', error);
        // Set fallback categories if API fails
        const fallbackCategories: KpiCategory[] = [
          { name: 'financial', display_name: 'Financial' },
          { name: 'sales_revenue', display_name: 'Sales Revenue' },
          { name: 'human_capital', display_name: 'Human Capital' },
          { name: 'marketing', display_name: 'Marketing' },
          {
            name: 'inventory_supply_chain',
            display_name: 'Inventory Supply Chain',
          },
          { name: 'project_costing', display_name: 'Project Costing' },
          {
            name: 'planning_performance',
            display_name: 'Planning Performance',
          },
        ];
        setKpiCategories(fallbackCategories);
        setAvailableKpis([]);
      }
    };

    loadKpiData();
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Get the active tab category info
  const activeTabInfo = reportCategories.find((cat) => cat.id === activeTab);

  const handleSubmenuClick = (submenuId: string) => {
    const el = cardRefs.current[submenuId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Check if current tab should show FP&A filters
  const shouldShowFpaFilters = [
    'financial_analytics',
    'revenue_analytics',
    'expense_analytics',
    'budget_analytics',
    'cashflow',
    'revenue',
    'sales',
    'human_capital',
    'sales_inventory',
  ].includes(activeTab);

  // Check if current tab should show KPI section
  const shouldShowKpiSection = [
    'financial_analytics',
    'revenue_analytics',
    'expense_analytics',
    'human_capital',
    'sales_inventory',
  ].includes(activeTab);

  // Use actual KPI data from API or fallback to sample data
  const displayKpis =
    availableKpis.length > 0
      ? availableKpis.filter((kpi) => kpi.category === selectedKpiCategory)
      : [
          {
            name: 'customer_acquisition_cost',
            display_name: 'Customer Acquisition Cost (CAC)',
            category: 'sales_revenue',
          },
          {
            name: 'sales_growth_rate',
            display_name: 'Sales Growth Rate',
            category: 'sales_revenue',
          },
          {
            name: 'revenue_per_employee',
            display_name: 'Revenue Per Employee',
            category: 'human_capital',
          },
          {
            name: 'headcount_growth_rate',
            display_name: 'Headcount Growth Rate',
            category: 'human_capital',
          },
        ];

  return (
    <RootLayout>
      <div className="pl-8 flex h-[92vh]">
        {/* Vertical Sidebar */}
        <Sidebar
          reportCategories={reportCategories}
          activeTab={activeTab}
          setActiveTab={(id) => setActiveTab(id as any)}
          onSubmenuClick={handleSubmenuClick}
          initialOpenSubmenu={initialOpenSubmenu}
        />

        {/* Main Content - Only this section scrolls */}
        <main className="flex-1 px-4 py-4 overflow-y-auto h-full">
          {/* Search bar and heading */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3 mb-4 ">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleClearSearch={handleClearSearch}
            />
          </div>

          {/* Tab title heading */}
          <div className="mb-3 mt-2">
            <div className="flex items-center">
              <h1 className="text-2xl font-medium text-gray-800">
                {activeTabInfo?.label || 'Reports'}
              </h1>
            </div>
          </div>

          {/* FP&A Tab Filter - Show only for FP&A related tabs */}
          {shouldShowFpaFilters && (
            <FPATabFilter
              activeTab={fpaActiveTab}
              setActiveTab={setFpaActiveTab}
              timeCycleTab={timeCycleTab}
              setTimeCycleTab={setTimeCycleTab}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedVillage={selectedVillage}
              setSelectedVillage={setSelectedVillage}
              selectedTown={selectedTown}
              setSelectedTown={setSelectedTown}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
            />
          )}

          {/* KPI Section */}
          {shouldShowKpiSection && (
            <div className="mb-8">
              {/* <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">
                  Key Performance Indicators
                </h2>
                <div className="flex items-center gap-2">
                  <SearchableSelect
                    options={kpiCategories.map((category) => ({
                      value: category.name,
                      label: category.display_name,
                    }))}
                    selectedValue={selectedKpiCategory}
                    onChange={setSelectedKpiCategory}
                    placeholder="Select KPI Category"
                    isDisabled={kpiCategories.length === 0}
                    label="Category:"
                    labelClass="text-sm font-medium text-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {displayKpis.map((kpi: any) => (
                  <KpiCard
                    key={kpi.name}
                    kpiName={kpi.name}
                    displayName={kpi.display_name}
                    category={kpi.category}
                    timeGranularity={timeCycleTab.toLowerCase() as any}
                    useMockData={true}
                  />
                ))}
              </div> */}
            </div>
          )}

          {/* Reports grid with more dummy chart cards */}
          {activeTab === 'api_debug' ? (
            <ApiDebugTest />
          ) : [
              'revenue_analytics',
              'expense_analytics',
              'financial_analytics',
              'human_capital',
              'sales_inventory',
            ].includes(activeTab) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {activeTabInfo?.submenus?.map((submenu) => {
                const analyticsSubmenu = submenu as any;
                return (
                  <div
                    key={submenu.id}
                    id={`card-${submenu.id}`}
                    ref={(el) => {
                      cardRefs.current[submenu.id] = el;
                    }}
                  >
                    <AnalyticsChartCard
                      title={submenu.label}
                      description={`${submenu.label} analytics data`}
                      factName={analyticsSubmenu.factName || 'revenue'}
                      metrics={analyticsSubmenu.metrics || ['total_revenue']}
                      dimensions={analyticsSubmenu.dimensions || ['time']}
                      chartType="bar"
                      module={analyticsSubmenu.module || 'finance'}
                    />
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'all' ? (
            <div className="flex flex-col gap-8">
              {/* Finance Module Fragment */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-black">
                    Finance Analytics
                  </h2>
                  <button
                    className="text-green-700 font-medium underline hover:underline text-sm px-3 py-1"
                    onClick={() => {
                      setActiveTab('financial_analytics' as ReportCategoryId);
                      setInitialOpenSubmenu('financial_analytics');
                      setTimeout(() => setInitialOpenSubmenu(undefined), 100);
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  <AnalyticsChartCard
                    title="Revenue Overview"
                    description="Total revenue analytics data"
                    factName="revenue"
                    metrics={['total_revenue']}
                    dimensions={['time']}
                    chartType="bar"
                    module="finance"
                  />
                  <AnalyticsChartCard
                    title="Revenue by Customer"
                    description="Revenue breakdown by customer"
                    factName="revenue"
                    metrics={['total_revenue']}
                    dimensions={['time', 'customer']}
                    chartType="bar"
                    module="finance"
                  />
                </div>
              </div>

              {/* Human Capital Module Fragment */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-black">
                    Human Capital Analytics
                  </h2>
                  <button
                    className="text-green-700 font-medium underline hover:underline text-sm px-3 py-1"
                    onClick={() => {
                      setActiveTab('human_capital' as ReportCategoryId);
                      setInitialOpenSubmenu('human_capital');
                      setTimeout(() => setInitialOpenSubmenu(undefined), 100);
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  <AnalyticsChartCard
                    title="Headcount Overview"
                    description="Total headcount analytics data"
                    factName="headcount"
                    metrics={['headcount']}
                    dimensions={['time']}
                    chartType="bar"
                    module="human_capital"
                  />
                  <AnalyticsChartCard
                    title="Headcount by Role"
                    description="Headcount breakdown by role"
                    factName="headcount"
                    metrics={['headcount']}
                    dimensions={['time', 'role']}
                    chartType="bar"
                    module="human_capital"
                  />
                </div>
              </div>

              {/* Sales & Inventory Module Fragment */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-black">
                    Sales & Inventory Analytics
                  </h2>
                  <button
                    className="text-green-700 font-medium underline hover:underline text-sm px-3 py-1"
                    onClick={() => {
                      setActiveTab('sales_inventory' as ReportCategoryId);
                      setInitialOpenSubmenu('sales_inventory');
                      setTimeout(() => setInitialOpenSubmenu(undefined), 100);
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  <AnalyticsChartCard
                    title="Sales Overview"
                    description="Total sales analytics data"
                    factName="units_sold"
                    metrics={['total_units_sold', 'total_revenue']}
                    dimensions={['time']}
                    chartType="bar"
                    module="sales_inventory"
                  />
                  <AnalyticsChartCard
                    title="Sales by Product"
                    description="Sales breakdown by product"
                    factName="units_sold"
                    metrics={['total_units_sold', 'total_revenue']}
                    dimensions={['time', 'product']}
                    chartType="bar"
                    module="sales_inventory"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {activeTabInfo?.submenus?.map((submenu) => {
                const chartConfig = (reportCharts as any)[submenu.chartKey];
                return (
                  <div
                    key={submenu.id}
                    id={`card-${submenu.id}`}
                    ref={(el) => {
                      cardRefs.current[submenu.id] = el;
                    }}
                  >
                    {chartConfig ? (
                      <ReportChartCard
                        title={chartConfig.title}
                        description={chartConfig.description}
                        chartType={chartConfig.chartType}
                        data={chartConfig.data}
                        options={chartConfig.options}
                        summary={chartConfig.summary}
                      />
                    ) : (
                      <div className="border border-dashed border-green-300 p-8 text-center text-gray-400">
                        {submenu.label} (No chart config)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </RootLayout>
  );
};

export default ReportsPage;
