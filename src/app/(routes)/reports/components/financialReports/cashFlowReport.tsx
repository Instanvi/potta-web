import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { ArrowUpCircle, ArrowDownCircle, Briefcase, LineChart, DollarSign } from 'lucide-react';
import { CashFlow, CashFlowKPIs, ReportPeriod } from '../../utils/financialTypes';

interface CashFlowReportProps {
  reportPeriod: ReportPeriod;
  cashFlow: CashFlow;
  kpis: CashFlowKPIs;
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({
  reportPeriod,
  cashFlow,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Cash Flow Statement</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Operating Cash</p>
                <p className="text-xl font-medium">${kpis.totalOperatingCash.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Investing Cash</p>
                <p className="text-xl font-medium">${kpis.totalInvestingCash.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Financing Cash</p>
                <p className="text-xl font-medium">${kpis.totalFinancingCash.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Net Cash Flow</p>
                <p className="text-xl font-medium">${kpis.netCashFlow.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Cash Balance</p>
                <p className="text-xl font-medium">${kpis.cashBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cash Flow Details */}
      <Card>
        <CardBody className="p-4">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Opening Cash Balance</TableCell>
                <TableCell className="text-right">${cashFlow.openingBalance.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow className="border-t">
                <TableCell className="font-medium">Cash from Operating Activities</TableCell>
                <TableCell className="text-right">
                  <span className={cashFlow.operatingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${cashFlow.operatingActivities.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Cash from Investing Activities</TableCell>
                <TableCell className="text-right">
                  <span className={cashFlow.investingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${cashFlow.investingActivities.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Cash from Financing Activities</TableCell>
                <TableCell className="text-right">
                  <span className={cashFlow.financingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${cashFlow.financingActivities.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow className="border-t">
                <TableCell className="font-medium">Net Increase in Cash</TableCell>
                <TableCell className="text-right font-medium">
                  <span className={cashFlow.netIncreaseInCash >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${cashFlow.netIncreaseInCash.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>

              <TableRow className="border-t">
                <TableCell className="font-medium text-lg">Closing Cash Balance</TableCell>
                <TableCell className="text-right font-medium text-lg">
                  ${cashFlow.closingBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default CashFlowReport;
