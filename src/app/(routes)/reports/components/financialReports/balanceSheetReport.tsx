import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Building2, Wallet, Scale, TrendingUp, PieChart } from 'lucide-react';
import { BalanceSheet, BalanceSheetKPIs, ReportPeriod } from '../../utils/financialTypes';

interface BalanceSheetReportProps {
  reportPeriod: ReportPeriod;
  balanceSheet: BalanceSheet;
  kpis: BalanceSheetKPIs;
}

const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({
  reportPeriod,
  balanceSheet,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Balance Sheet Report</h1>
        <div className="text-sm text-gray-500">
          <p>As of: {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="text-xl font-medium">${kpis.totalAssets.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Total Liabilities</p>
                <p className="text-xl font-medium">${kpis.totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Net Worth</p>
                <p className="text-xl font-medium">${kpis.netWorth.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Equity/Asset</p>
                <p className="text-xl font-medium">{(kpis.equityToAssetRatio * 100).toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Debt/Equity</p>
                <p className="text-xl font-medium">{kpis.debtToEquityRatio.toFixed(2)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Balance Sheet Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Assets */}
        <Card>
          <CardBody className="p-4">
            <h2 className="text-lg font-medium mb-4">Assets</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Assets</span>
                <span>${balanceSheet.assets.currentAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Fixed Assets</span>
                <span>${balanceSheet.assets.fixedAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Assets</span>
                <span>${balanceSheet.assets.totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardBody className="p-4">
            <h2 className="text-lg font-medium mb-4">Liabilities</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Liabilities</span>
                <span>${balanceSheet.liabilities.currentLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Long-term Liabilities</span>
                <span>${balanceSheet.liabilities.longTermLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Liabilities</span>
                <span>${balanceSheet.liabilities.totalLiabilities.toLocaleString()}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Equity */}
        <Card>
          <CardBody className="p-4">
            <h2 className="text-lg font-medium mb-4">Shareholders Equity</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Shareholders Equity</span>
                <span>${balanceSheet.equity.shareholdersEquity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Equity</span>
                <span>${balanceSheet.equity.totalEquity.toLocaleString()}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheetReport;
