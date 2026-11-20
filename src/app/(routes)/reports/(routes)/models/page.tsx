'use client';
import React, { useState, useContext, useEffect } from 'react';
import { modelsMenu } from './components/modelsMenu';
import Sidebar from '../../components/Sidebar';
import RootLayout from '@potta/app/(routes)/layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import DynamicTable from './components/DynamicTable';
import MyTable from '@potta/components/table';
import DynamicAccountTable, {
  DynamicAccountTableColumn,
} from './components/DynamicAccountTable';
import {
  plData,
  balanceSheetData,
  cashFlowData,
  budgetActualsData,
  financialRatiosData,
  salesForecastData,
  breakEvenData,
  scenarioAnalysisData,
  plColumns,
  balanceSheetColumns,
  cashFlowColumns,
  budgetActualsColumns,
  financialRatiosColumns,
  salesForecastColumns,
  breakEvenColumns,
  scenarioAnalysisColumns,
} from './components/modelData';
import Button from '@potta/components/button';

// Helper to flatten P&L data for MyTable
type PLRow = {
  label: string;
  value?: number;
  percent?: number;
  children?: PLRow[];
  highlight?: boolean;
  id?: string;
  parentId?: string | null;
};

function flattenPLData(data: PLRow[], parent: PLRow | null = null): PLRow[] {
  return data.map((row: PLRow, idx: number) => ({
    ...row,
    id: parent ? `${parent.id}-${idx}` : `${idx}`,
    parentId: parent ? parent.id : null,
    children: row.children
      ? flattenPLData(row.children, {
          ...row,
          id: parent ? `${parent.id}-${idx}` : `${idx}`,
        })
      : undefined,
  }));
}

const plTableData = flattenPLData(plData);

const plTableColumns = [
  {
    name: 'Description',
    selector: (row: PLRow) => row.label,
    sortable: false,
    width: '40%',
    cell: (row: PLRow) => (
      <span className={row.children ? 'font-medium' : ''}>{row.label}</span>
    ),
  },
  {
    name: 'Amount (FCFA)',
    selector: (row: PLRow) => row.value,
    sortable: false,
    width: '30%',
    cell: (row: PLRow) =>
      row.value !== undefined ? `${row.value.toLocaleString()} FCFA` : '',
    right: true,
  },
  {
    name: '% of Revenue',
    selector: (row: PLRow) => row.percent,
    sortable: false,
    width: '30%',
    cell: (row: PLRow) =>
      row.percent !== undefined ? `${row.percent.toFixed(1)}%` : '',
    right: true,
  },
];

const ExpandablePLRow = ({ data }: { data: PLRow }) => {
  if (!data.children || data.children.length === 0) return null;
  return (
    <div className="pl-8">
      <MyTable
        columns={plTableColumns}
        data={data.children}
        expanded={false}
        pagination={false}
        selectable={false}
        pointerOnHover={false}
        hoverBackgroundColor="#f3f3f3"
        minHeight="0"
      />
    </div>
  );
};

const modelTables: Record<string, JSX.Element> = {
  pl_template: (
    <DynamicAccountTable columns={plColumns} data={plData} minHeight="0" />
  ),
  balance_sheet: (
    <DynamicAccountTable
      columns={balanceSheetColumns}
      data={balanceSheetData}
      minHeight="0"
    />
  ),
  cash_flow: (
    <DynamicAccountTable
      columns={cashFlowColumns}
      data={cashFlowData}
      minHeight="0"
    />
  ),
  budget_actuals: (
    <DynamicAccountTable
      columns={budgetActualsColumns}
      data={budgetActualsData}
      minHeight="0"
    />
  ),
  financial_ratios: (
    <DynamicAccountTable
      columns={financialRatiosColumns}
      data={financialRatiosData}
      minHeight="0"
    />
  ),
  sales_forecast: (
    <DynamicAccountTable
      columns={salesForecastColumns}
      data={salesForecastData}
      minHeight="0"
    />
  ),
  break_even: (
    <DynamicAccountTable
      columns={breakEvenColumns}
      data={breakEvenData}
      minHeight="0"
    />
  ),
  scenario_analysis: (
    <DynamicAccountTable
      columns={scenarioAnalysisColumns}
      data={scenarioAnalysisData}
      minHeight="0"
    />
  ),
};

export default function ModelsPage() {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState(modelsMenu[0].id);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(
    modelsMenu[0]?.submenus?.[0]?.id || null
  );

  const activeMenu = modelsMenu.find((cat) => cat.id === activeTab);
  const submenus = activeMenu?.submenus || [];

  useEffect(() => {
    if (submenus.length > 0) {
      setActiveSubmenu(submenus[0].id);
    } else {
      setActiveSubmenu(null);
    }
  }, [activeTab, submenus]);

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
      <div className={`pl-8 flex h-[92vh] overflow-hidden`}>
        {/* Left Sidebar */}
        <Sidebar
          reportCategories={modelsMenu}
          activeTab={activeTab}
          setActiveTab={(id) => setActiveTab(id as any)}
          onSubmenuClick={(submenuId: string) => setActiveSubmenu(submenuId)}
          initialOpenSubmenu={modelsMenu[0]?.id}
        />
        {/* Right Content */}
        <main className="h-full overflow-hidden flex flex-col min-h-0 px-4 py-4">
          {showTableId && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-800">
                {tableLabel}
              </h2>
              <Button
                type="button"
                color
                text="Export"
                icon={<img src="/images/export.svg" alt="Export" />}
                theme="lightBlue"
                className="!text-black whitespace-nowrap"
                onClick={() => {
                  /* TODO: Implement export logic */
                }}
              />
            </div>
          )}
          <div className=" min-h-0">
            {showTableId && modelTables[showTableId]}
          </div>
        </main>
      </div>
    </RootLayout>
  );
}
