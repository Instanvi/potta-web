import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { DollarSign, TrendingUp, PieChart, BarChart, LineChart } from 'lucide-react';
import { IncomeStatement, IncomeStatementKPIs, ReportPeriod } from '../../utils/financialTypes';

interface IncomeStatementReportProps {
  reportPeriod: ReportPeriod;
  incomeStatement: IncomeStatement;
  kpis: IncomeStatementKPIs;
}

const IncomeStatementReport: React.FC<IncomeStatementReportProps> = ({
  reportPeriod,
  incomeStatement,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Income Statement Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-medium">${kpis.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Gross Margin</p>
                <p className="text-xl font-medium">{kpis.grossProfitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Operating Margin</p>
                <p className="text-xl font-medium">{kpis.operatingProfitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Net Margin</p>
                <p className="text-xl font-medium">{kpis.netProfitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">EBITDA</p>
                <p className="text-xl font-medium">${kpis.ebitda.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Income Statement Details */}
      <Card>
        <CardBody className="p-4">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenue</TableCell>
                <TableCell className="text-right">${incomeStatement.revenue.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost of Goods Sold</TableCell>
                <TableCell className="text-right text-red-600">
                  (${incomeStatement.cogs.toLocaleString()})
                </TableCell>
              </TableRow>
              <TableRow className="border-t">
                <TableCell className="font-medium">Gross Profit</TableCell>
                <TableCell className="text-right font-medium">
                  ${incomeStatement.grossProfit.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operating Expenses</TableCell>
                <TableCell className="text-right text-red-600">
                  (${incomeStatement.operatingExpenses.toLocaleString()})
                </TableCell>
              </TableRow>
              <TableRow className="border-t">
                <TableCell className="font-medium">Operating Profit (EBIT)</TableCell>
                <TableCell className="text-right font-medium">
                  ${incomeStatement.operatingProfit.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Interest Expense</TableCell>
                <TableCell className="text-right text-red-600">
                  (${incomeStatement.interestExpense.toLocaleString()})
                </TableCell>
              </TableRow>
              <TableRow className="border-t">
                <TableCell className="font-medium">Pre-tax Profit</TableCell>
                <TableCell className="text-right">
                  ${incomeStatement.preTaxProfit.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Taxes</TableCell>
                <TableCell className="text-right text-red-600">
                  (${incomeStatement.taxes.toLocaleString()})
                </TableCell>
              </TableRow>
              <TableRow className="border-t">
                <TableCell className="font-medium text-lg">Net Profit</TableCell>
                <TableCell className="text-right font-medium text-lg">
                  ${incomeStatement.netProfit.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default IncomeStatementReport;
