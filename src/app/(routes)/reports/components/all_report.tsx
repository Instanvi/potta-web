import React from 'react';
import { Tabs, Tab } from "@nextui-org/react";
import PaymentSummaryReport from './disbursementReports/paymentSummaryReport';
import BudgetUtilizationReport from './disbursementReports/budgetUtilizationReport';


const FinancePage = () => {
  // Sample data - in a real application, this would come from your API
  const sampleData = {
    reportPeriod: {
      startDate: '2025-03-01',
      endDate: '2025-03-31',
    },
    payments: [
      {
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },
      {
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },{
        paymentId: 'PAY001',
        payee: 'Vendor A',
        paymentDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 5000,
        paymentStatus: 'completed',
        invoiceId: 'INV001',
        disbursementType: 'Vendor Payment',
      },
    ],
    paymentKpis: {
      totalPaymentsMade: 50000,
      numberOfPayments: 25,
      mostCommonPaymentMethod: 'Bank Transfer',
      largestPayment: 10000,
      outstandingPayments: 3,
    },
    budgets: [
      {
        budgetId: 'BUD001',
        budgetName: 'Marketing Q1',
        allocatedBudget: 100000,
        amountSpent: 75000,
        remainingBudget: 25000,
        utilizationPercentage: 75,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        department: 'Marketing',
      },
      // Add more budgets...
    ],
    budgetKpis: {
      totalBudgetAllocated: 500000,
      totalAmountSpent: 350000,
      overallUtilizationRate: 70,
      departmentWithHighestUtilization: 'Sales',
      departmentWithLowestUtilization: 'IT',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Tabs
        aria-label="Finance Reports"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab key="payments" title="Payment Summary">
          <PaymentSummaryReport
            reportPeriod={sampleData.reportPeriod}
            payments={sampleData.payments}
            kpis={sampleData.paymentKpis}
          />
        </Tab>
        <Tab key="budget" title="Budget Utilization">
          <BudgetUtilizationReport
            reportPeriod={sampleData.reportPeriod}
            budgets={sampleData.budgets}
            kpis={sampleData.budgetKpis}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default FinancePage;
