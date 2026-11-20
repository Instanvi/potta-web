import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from "@potta/components/card"
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react'

const FinancialReports = () => {
  const reports = [
    {
      title: "Balance Sheet",
      description: "Comprehensive view of assets, liabilities, and equity",
      icon: BarChart3,
      path: "/reports/balance-sheet"
    },
    {
      title: "Income Statement",
      description: "Detailed profit and loss statement",
      icon: LineChart,
      path: "/reports/income-statement"
    },
    {
      title: "Cash Flow Statement",
      description: "Track cash movements across all activities",
      icon: TrendingUp,
      path: "/reports/cash-flow"
    },
    {
      title: "Accounts Receivable Aging",
      description: "Monitor outstanding customer payments",
      icon: Clock,
      path: "/reports/ar-aging"
    },
    {
      title: "Accounts Payable Aging",
      description: "Track vendor payments and due dates",
      icon: Calendar,
      path: "/reports/ap-aging"
    },
    {
      title: "Budget vs Actual",
      description: "Compare budgeted amounts with actual spending",
      icon: DollarSign,
      path: "/reports/budget-actual"
    }
  ]

  return (
    <div className="">
      <h2 className="text-2xl font-medium mb-6">Financial Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <report.icon className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
              <CardDescription className=''>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FinancialReports
