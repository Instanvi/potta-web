'use client';
import React, { useState } from 'react';
import { pottaAnalyticsService } from '../../../../services/analyticsService';

const ApiDebugTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults((prev) => [
      ...prev,
      { test, result, timestamp: new Date().toISOString() },
    ]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // KPI Tests
  const testKpiAvailable = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/kpi/v1/available endpoint...');
      const kpisResponse = await pottaAnalyticsService.kpi.getAvailableKpis();
      addResult('KPI Available', { success: true, data: kpisResponse });
      console.log('✅ KPI Available test successful:', kpisResponse);

      // Log available KPI names for easy reference
      if (kpisResponse.kpis && Array.isArray(kpisResponse.kpis)) {
        const kpiNames = kpisResponse.kpis.map((kpi) => kpi.name);
        console.log('📋 Available KPI Names:', kpiNames);
        addResult('KPI Names', { success: true, data: kpiNames });
      }
    } catch (error) {
      addResult('KPI Available', { success: false, error: error });
      console.error('❌ KPI Available test failed:', error);
    }
    setLoading(false);
  };

  const testKpiCategories = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/kpi/v1/categories endpoint...');
      const categoriesResponse =
        await pottaAnalyticsService.kpi.getKpiCategories();
      addResult('KPI Categories', { success: true, data: categoriesResponse });
      console.log('✅ KPI Categories test successful:', categoriesResponse);

      // Log available category names for easy reference
      if (
        categoriesResponse.categories &&
        Array.isArray(categoriesResponse.categories)
      ) {
        const categoryNames = categoriesResponse.categories.map(
          (cat) => cat.name
        );
        console.log('📋 Available KPI Category Names:', categoryNames);
        addResult('KPI Category Names', { success: true, data: categoryNames });
      }
    } catch (error) {
      addResult('KPI Categories', { success: false, error: error });
      console.error('❌ KPI Categories test failed:', error);
    }
    setLoading(false);
  };

  const testKpiCalculate = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/kpi/v1/calculate endpoint...');
      const kpiResult = await pottaAnalyticsService.kpi.calculateKpi({
        kpi_name: 'revenue_growth_rate',
        organization_id: 'test-org',
        time_granularity: 'monthly',
        use_mock_data: true,
      });
      addResult('KPI Calculate', { success: true, data: kpiResult });
      console.log('✅ KPI Calculate test successful:', kpiResult);
    } catch (error) {
      addResult('KPI Calculate', { success: false, error: error });
      console.error('❌ KPI Calculate test failed:', error);
    }
    setLoading(false);
  };

  // Finance Tests
  const testFinanceFacts = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/finance/v1/facts endpoint...');
      const facts = await pottaAnalyticsService.finance.getAvailableFacts();
      addResult('Finance Facts', { success: true, data: facts });
      console.log('✅ Finance Facts test successful:', facts);

      // Log available fact table names for easy reference
      if (facts && typeof facts === 'object') {
        const factTableNames = Object.keys(facts);
        console.log('📋 Available Finance Fact Tables:', factTableNames);
        addResult('Finance Fact Table Names', {
          success: true,
          data: factTableNames,
        });
      }
    } catch (error) {
      addResult('Finance Facts', { success: false, error: error });
      console.error('❌ Finance Facts test failed:', error);
    }
    setLoading(false);
  };

  const testFinanceDimensions = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/finance/v1/dimensions endpoint...');
      const dimensions =
        await pottaAnalyticsService.finance.getAvailableDimensions();
      addResult('Finance Dimensions', { success: true, data: dimensions });
      console.log('✅ Finance Dimensions test successful:', dimensions);
    } catch (error) {
      addResult('Finance Dimensions', { success: false, error: error });
      console.error('❌ Finance Dimensions test failed:', error);
    }
    setLoading(false);
  };

  const testFinanceRevenue = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/finance/v1/revenue endpoint...');
      const revenue = await pottaAnalyticsService.finance.getRevenueData(
        'monthly'
      );
      addResult('Finance Revenue', { success: true, data: revenue });
      console.log('✅ Finance Revenue test successful:', revenue);
    } catch (error) {
      addResult('Finance Revenue', { success: false, error: error });
      console.error('❌ Finance Revenue test failed:', error);
    }
    setLoading(false);
  };

  const testFinanceExpenses = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/finance/v1/opex endpoint...');
      const expenses = await pottaAnalyticsService.finance.getExpenseData(
        'monthly'
      );
      addResult('Finance Expenses (OPEX)', { success: true, data: expenses });
      console.log('✅ Finance Expenses test successful:', expenses);
    } catch (error) {
      addResult('Finance Expenses (OPEX)', { success: false, error: error });
      console.error('❌ Finance Expenses test failed:', error);
    }
    setLoading(false);
  };

  // Human Capital Tests
  const testHumanCapitalFacts = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/human-capital/v1/facts endpoint...');
      const facts =
        await pottaAnalyticsService.humanCapital.getAvailableFacts();
      addResult('Human Capital Facts', { success: true, data: facts });
      console.log('✅ Human Capital Facts test successful:', facts);

      // Log available fact table names for easy reference
      if (facts && typeof facts === 'object') {
        const factTableNames = Object.keys(facts);
        console.log('📋 Available Human Capital Fact Tables:', factTableNames);
        addResult('Human Capital Fact Table Names', {
          success: true,
          data: factTableNames,
        });
      }
    } catch (error) {
      addResult('Human Capital Facts', { success: false, error: error });
      console.error('❌ Human Capital Facts test failed:', error);
    }
    setLoading(false);
  };

  const testHumanCapitalHeadcount = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/human-capital/v1/headcount endpoint...');
      const headcount =
        await pottaAnalyticsService.humanCapital.getHeadcountData('monthly');
      addResult('Human Capital Headcount', { success: true, data: headcount });
      console.log('✅ Human Capital Headcount test successful:', headcount);
    } catch (error) {
      addResult('Human Capital Headcount', { success: false, error: error });
      console.error('❌ Human Capital Headcount test failed:', error);
    }
    setLoading(false);
  };

  const testHumanCapitalPayroll = async () => {
    setLoading(true);
    try {
      console.log(
        '🧪 Testing /api/human-capital/v1/salary_expenses_monthly endpoint...'
      );
      const payroll = await pottaAnalyticsService.humanCapital.getPayrollData(
        'monthly'
      );
      addResult('Human Capital Payroll', { success: true, data: payroll });
      console.log('✅ Human Capital Payroll test successful:', payroll);
    } catch (error) {
      addResult('Human Capital Payroll', { success: false, error: error });
      console.error('❌ Human Capital Payroll test failed:', error);
    }
    setLoading(false);
  };

  const testHumanCapitalSalaryExpenses = async () => {
    setLoading(true);
    try {
      console.log(
        '🧪 Testing /api/human-capital/v1/salary_expenses endpoint...'
      );
      const salaryExpenses =
        await pottaAnalyticsService.humanCapital.getSalaryExpensesData(
          'monthly'
        );
      addResult('Human Capital Salary Expenses', {
        success: true,
        data: salaryExpenses,
      });
      console.log(
        '✅ Human Capital Salary Expenses test successful:',
        salaryExpenses
      );
    } catch (error) {
      addResult('Human Capital Salary Expenses', {
        success: false,
        error: error,
      });
      console.error('❌ Human Capital Salary Expenses test failed:', error);
    }
    setLoading(false);
  };

  // Sales & Inventory Tests
  const testSalesInventoryFacts = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/sales-inventory/v1/facts endpoint...');
      const facts =
        await pottaAnalyticsService.salesInventory.getAvailableFacts();
      addResult('Sales & Inventory Facts', { success: true, data: facts });
      console.log('✅ Sales & Inventory Facts test successful:', facts);

      // Log available fact table names for easy reference
      if (facts && typeof facts === 'object') {
        const factTableNames = Object.keys(facts);
        console.log(
          '📋 Available Sales & Inventory Fact Tables:',
          factTableNames
        );
        addResult('Sales & Inventory Fact Table Names', {
          success: true,
          data: factTableNames,
        });
      }
    } catch (error) {
      addResult('Sales & Inventory Facts', { success: false, error: error });
      console.error('❌ Sales & Inventory Facts test failed:', error);
    }
    setLoading(false);
  };

  const testSalesInventorySales = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/sales-inventory/v1/units_sold endpoint...');
      const sales = await pottaAnalyticsService.salesInventory.getSalesData(
        'monthly'
      );
      addResult('Sales & Inventory Units Sold', { success: true, data: sales });
      console.log('✅ Sales & Inventory Units Sold test successful:', sales);
    } catch (error) {
      addResult('Sales & Inventory Units Sold', {
        success: false,
        error: error,
      });
      console.error('❌ Sales & Inventory Units Sold test failed:', error);
    }
    setLoading(false);
  };

  const testSalesInventoryPerformance = async () => {
    setLoading(true);
    try {
      console.log(
        '🧪 Testing /api/sales-inventory/v1/sales_performance endpoint...'
      );
      const performance =
        await pottaAnalyticsService.salesInventory.getSalesPerformanceData(
          'monthly'
        );
      addResult('Sales & Inventory Performance', {
        success: true,
        data: performance,
      });
      console.log(
        '✅ Sales & Inventory Performance test successful:',
        performance
      );
    } catch (error) {
      addResult('Sales & Inventory Performance', {
        success: false,
        error: error,
      });
      console.error('❌ Sales & Inventory Performance test failed:', error);
    }
    setLoading(false);
  };

  const testSalesInventoryNewCustomers = async () => {
    setLoading(true);
    try {
      console.log(
        '🧪 Testing /api/sales-inventory/v1/new_customers endpoint...'
      );
      const newCustomers =
        await pottaAnalyticsService.salesInventory.getNewCustomersData(
          'monthly'
        );
      addResult('Sales & Inventory New Customers', {
        success: true,
        data: newCustomers,
      });
      console.log(
        '✅ Sales & Inventory New Customers test successful:',
        newCustomers
      );
    } catch (error) {
      addResult('Sales & Inventory New Customers', {
        success: false,
        error: error,
      });
      console.error('❌ Sales & Inventory New Customers test failed:', error);
    }
    setLoading(false);
  };

  const testAll = async () => {
    setLoading(true);
    clearResults();

    // Test KPI endpoints
    await testKpiAvailable();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testKpiCategories();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testKpiCalculate();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test Finance endpoints - Get facts first to see what's available
    await testFinanceFacts();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testFinanceDimensions();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test Human Capital endpoints - Get facts first
    await testHumanCapitalFacts();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test Sales & Inventory endpoints - Get facts first
    await testSalesInventoryFacts();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test specific data endpoints with correct fact tables
    await testFinanceRevenue();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testFinanceExpenses();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testHumanCapitalHeadcount();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testHumanCapitalPayroll();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testHumanCapitalSalaryExpenses();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testSalesInventorySales();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testSalesInventoryPerformance();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testSalesInventoryNewCustomers();

    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">
          Potta FP&A Metrics API Debug Test
        </h2>
        <p className="text-gray-600">
          Test the new modular API endpoints to verify functionality
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Test Controls
        </h3>

        {/* KPI Tests */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            KPI Endpoints
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={testKpiAvailable}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              Test KPI Available
            </button>
            <button
              onClick={testKpiCategories}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              Test KPI Categories
            </button>
            <button
              onClick={testKpiCalculate}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              Test KPI Calculate
            </button>
          </div>
        </div>

        {/* Finance Tests */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Finance Endpoints
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={testFinanceFacts}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              Test Finance Facts
            </button>
            <button
              onClick={testFinanceDimensions}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              Test Finance Dimensions
            </button>
            <button
              onClick={testFinanceRevenue}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              Test Finance Revenue
            </button>
            <button
              onClick={testFinanceExpenses}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              Test Finance Expenses
            </button>
          </div>
        </div>

        {/* Human Capital Tests */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Human Capital Endpoints
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={testHumanCapitalFacts}
              disabled={loading}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
            >
              Test HC Facts
            </button>
            <button
              onClick={testHumanCapitalHeadcount}
              disabled={loading}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
            >
              Test HC Headcount
            </button>
            <button
              onClick={testHumanCapitalPayroll}
              disabled={loading}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
            >
              Test HC Payroll
            </button>
            <button
              onClick={testHumanCapitalSalaryExpenses}
              disabled={loading}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
            >
              Test HC Salary Expenses
            </button>
          </div>
        </div>

        {/* Sales & Inventory Tests */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Sales & Inventory Endpoints
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={testSalesInventoryFacts}
              disabled={loading}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
            >
              Test S&I Facts
            </button>
            <button
              onClick={testSalesInventorySales}
              disabled={loading}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
            >
              Test S&I Units Sold
            </button>
            <button
              onClick={testSalesInventoryPerformance}
              disabled={loading}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
            >
              Test S&I Performance
            </button>
            <button
              onClick={testSalesInventoryNewCustomers}
              disabled={loading}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
            >
              Test S&I New Customers
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testAll}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 text-sm"
          >
            Test All Endpoints
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
        {results.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No test results yet. Click a test button above to start debugging.
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{result.test}</h4>
                <span className="text-sm text-gray-500">
                  {result.timestamp}
                </span>
              </div>
              <div className="text-sm">
                {result.result.success ? (
                  <div className="text-green-700">
                    <div className="font-medium">✅ Success</div>
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <div className="font-medium">❌ Failed</div>
                    <div className="mt-2 text-xs">
                      <strong>Error:</strong>{' '}
                      {result.result.error?.message || 'Unknown error'}
                    </div>
                    {result.result.error?.response?.status && (
                      <div className="text-xs">
                        <strong>Status:</strong>{' '}
                        {result.result.error.response.status}
                      </div>
                    )}
                    {result.result.error?.response?.data && (
                      <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(
                          result.result.error.response.data,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <div className="mt-2 text-center">Testing API endpoints...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugTest;
