'use client';
import React, { useState, useEffect, useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import RootLayout from '../../layout';
import ForecastHeader from './components/ForecastHeader';
import CashBalanceCard from './components/CashBalanceCard';
import ForecastChart from './components/ForecastChart';
import ForecastTable from './components/ForecastTable';
import CreateScenarioModal from './components/CreateScenarioModal';
import EditScenarioModal from './components/EditScenarioModal';
import DeleteScenarioModal from './components/DeleteScenarioModal';
import AddAdjustmentModal from './components/AddAdjustmentModal';
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  default as SkeletonLoader,
} from './components/SkeletonLoader';
// import DateNavigation from '../../payroll/timesheet/components/DateNavigation';
import { forecastingService } from '../../../../services/forecastingService';
import type { Scenario } from '../../../../services/forecastingService';

const CashFlowPage = () => {
  const context = useContext(ContextData);

  // State management
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('main');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 18)),
  });
  const [cycleTab, setCycleTab] = useState('Monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'consolidated' | 'detailed'>(
    'consolidated'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [deletingScenario, setDeletingScenario] = useState<Scenario | null>(
    null
  );
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Mock organization ID - in real app, get from auth context
  const organizationId = '41e4efaf-dbf5-4850-9fb8-0ea2a27bca0d';

  // Function to fetch comprehensive forecast data for multiple metrics
  const fetchComprehensiveForecastData = async (scenarioId?: string) => {
    try {
      const horizonMonths = Math.ceil(
        (dateRange.end.getTime() - dateRange.start.getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );

      // Define the metrics we need - RESTORE ALL METRICS
      const metrics = [
        'fcf',
        'revenue',
        'cogs',
        'opex',
        'salary_expense',
        'ocf',
      ];

      // Fetch data for each metric
      const metricDataPromises = metrics.map(async (metric) => {
        try {
          console.log(`Fetching ${metric} data for scenario: ${scenarioId}`);

          if (scenarioId && scenarioId !== 'main') {
            // For custom scenarios, use launch forecast
            const launchRequest = {
              organization_id: organizationId,
              entity_type: 'organization' as const,
              metric: metric,
              horizon_months: horizonMonths,
              scenario_id: scenarioId,
            };
            console.log(`Launch request for ${metric}:`, launchRequest);
            const result = await forecastingService.launchForecast(
              launchRequest
            );
            console.log(`Launch result for ${metric}:`, result);
            console.log(`${metric} baseline_id:`, result?.baseline_id);
            console.log(`${metric} metric field:`, result?.metric);
            console.log(
              `${metric} first forecast value:`,
              result?.forecast?.[0]?.value
            );
            return result;
          } else {
            // For main scenario, use baseline run
            const baselineRequest = {
              metric: metric,
              organization_id: organizationId,
              entity_type: 'organization' as const,
              horizon_months: horizonMonths,
            };
            console.log(`Baseline request for ${metric}:`, baselineRequest);
            const result = await forecastingService.createBaselineRun(
              baselineRequest
            );
            console.log(`Baseline result for ${metric}:`, result);
            console.log(`${metric} baseline_id:`, result?.baseline_id);
            console.log(`${metric} metric field:`, result?.metric);
            console.log(
              `${metric} first forecast value:`,
              result?.forecast?.[0]?.value
            );
            return result;
          }
        } catch (error) {
          console.error(`Error fetching ${metric} data:`, error);
          return null;
        }
      });

      // Wait for all metric data to be fetched
      const metricDataResults = await Promise.all(metricDataPromises);

      console.log('=== ALL METRIC RESULTS COMPARISON ===');
      metricDataResults.forEach((result, index) => {
        const metric = [
          'fcf',
          'revenue',
          'cogs',
          'opex',
          'salary_expense',
          'ocf',
        ][index];
        console.log(`${metric} result:`, result);
        if (result && result.forecast) {
          console.log(
            `${metric} first 3 values:`,
            result.forecast.slice(0, 3).map((item: any) => item.value)
          );
          console.log(`${metric} baseline_id:`, result.baseline_id);
          console.log(`${metric} metric field:`, result.metric);
        }
      });

      // Check if all metrics return the same values (which would be a problem)
      const firstResult = metricDataResults[0];
      if (firstResult && firstResult.forecast) {
        const firstValues = firstResult.forecast
          .slice(0, 3)
          .map((item: any) => item.value);
        console.log('=== CHECKING IF ALL METRICS RETURN SAME VALUES ===');
        console.log('First metric (FCF) values:', firstValues);

        metricDataResults.forEach((result, index) => {
          const metric = [
            'fcf',
            'revenue',
            'cogs',
            'opex',
            'salary_expense',
            'ocf',
          ][index];
          if (result && result.forecast) {
            const values = result.forecast
              .slice(0, 3)
              .map((item: any) => item.value);
            const isSame =
              JSON.stringify(values) === JSON.stringify(firstValues);
            console.log(
              `${metric} values:`,
              values,
              isSame ? 'SAME AS FCF' : 'DIFFERENT FROM FCF'
            );
          }
        });
      }

      // Combine the data from all metrics
      const combinedData = combineMetricData(metricDataResults, scenarioId);

      return combinedData;
    } catch (error) {
      console.error('Error fetching comprehensive forecast data:', error);
      throw error;
    }
  };

  // Function to combine data from multiple metrics
  const combineMetricData = (metricDataResults: any[], scenarioId?: string) => {
    console.log('Combining metric data for scenario:', scenarioId);
    console.log('Metric data results:', metricDataResults);

    // Find the first valid result to get the date structure
    const firstValidResult = metricDataResults.find(
      (result) => result && result.forecast
    );

    console.log('First valid result:', firstValidResult);

    if (!firstValidResult || !firstValidResult.forecast) {
      console.warn('No valid result found with forecast data');
      return [];
    }

    // Create a map of date to all metric values
    const dateMetricMap = new Map();

    // Process each metric's data
    metricDataResults.forEach((result, index) => {
      if (result && result.forecast) {
        const metric = [
          'fcf',
          'revenue',
          'cogs',
          'opex',
          'salary_expense',
          'ocf',
        ][index];

        console.log(`Processing ${metric} data:`, result);
        console.log(`${metric} forecast length:`, result.forecast.length);
        console.log(`${metric} first value:`, result.forecast[0]?.value);

        result.forecast.forEach((item: any) => {
          const date = item.date;
          if (!dateMetricMap.has(date)) {
            dateMetricMap.set(date, {
              date: date,
              month: new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit',
              }),
            });
          }
          dateMetricMap.get(date)[metric] = item.value || 0;
        });
      } else {
        console.warn(
          `No data for metric ${
            ['fcf', 'revenue', 'cogs', 'opex', 'salary_expense', 'ocf'][index]
          }:`,
          result
        );
      }
    });

    // Convert map to array and calculate derived values
    const dateArray = Array.from(dateMetricMap.values());

    // Calculate cumulative cash balance progression
    // Start with a reasonable starting balance (this should come from actual current balance)
    // For now, let's start from 0 and let the first month's net cash flow set the initial balance
    let cumulativeBalance = 0;

    const combinedData = dateArray.map((item, index) => {
      // Calculate cash flow components from actual API data
      const fcf = item.fcf || 0;
      const revenue = item.revenue || 0;
      const cogs = item.cogs || 0;
      const opex = item.opex || 0;
      const salaryExpense = item.salary_expense || 0;
      const ocf = item.ocf || 0;

      // Calculate cash inflows and outflows from actual data
      const cashInflow = revenue; // Revenue is the main cash inflow
      const cashOutflow = cogs + opex + salaryExpense; // COGS + OPEX + Salary are main cash outflows
      const netCashFlow = cashInflow - cashOutflow; // Calculate net cash flow from actual data, not FCF

      // Calculate cumulative balance progression
      const previousCumulative = cumulativeBalance;
      cumulativeBalance += netCashFlow;

      const result = {
        ...item,
        // Cash flow data from actual API
        net_cash_flow: netCashFlow,
        monthly_fcf: fcf,
        monthly_revenue: revenue,
        monthly_cogs: cogs,
        monthly_opex: opex,
        monthly_salary_expense: salaryExpense,
        monthly_ocf: ocf,
        // Calculated cash flow components from actual data
        cash_inflow: cashInflow,
        cash_outflow: cashOutflow,
        // Use cumulative net cash flow as cash balance (shows actual progression from calculated data)
        cash_balance_beginning: previousCumulative,
        cash_balance_end: cumulativeBalance,
        // Scenario info
        scenario_id: scenarioId,
      };

      // Debug first few items
      if (index < 3) {
        console.log(`=== MONTH ${index + 1} CALCULATIONS ===`);
        console.log(
          `Revenue: ${revenue}, COGS: ${cogs}, OPEX: ${opex}, Salary: ${salaryExpense}`
        );
        console.log(`Cash Inflow: ${cashInflow}, Cash Outflow: ${cashOutflow}`);
        console.log(
          `Net Cash Flow: ${netCashFlow} (calculated), FCF: ${fcf} (from API)`
        );
        console.log(
          `Cash Balance: ${previousCumulative} → ${cumulativeBalance}`
        );
      }

      return result;
    });

    console.log('Final combined data:', combinedData);
    console.log('Combined data length:', combinedData.length);

    // Debug: Check if we have different values for different metrics
    if (combinedData.length > 0) {
      const firstItem = combinedData[0];
      console.log('=== FINAL COMBINED DATA DEBUG ===');
      console.log('First item metrics:', {
        fcf: firstItem.fcf,
        revenue: firstItem.monthly_revenue,
        cogs: firstItem.monthly_cogs,
        opex: firstItem.monthly_opex,
        salary_expense: firstItem.monthly_salary_expense,
        ocf: firstItem.monthly_ocf,
      });
      console.log('First item cash flows:', {
        cash_inflow: firstItem.cash_inflow,
        cash_outflow: firstItem.cash_outflow,
        net_cash_flow: firstItem.net_cash_flow,
        cash_balance_beginning: firstItem.cash_balance_beginning,
        cash_balance_end: firstItem.cash_balance_end,
      });
      console.log(
        'First 3 items cash inflows:',
        combinedData.slice(0, 3).map((item) => item.cash_inflow)
      );
      console.log(
        'First 3 items cash outflows:',
        combinedData.slice(0, 3).map((item) => item.cash_outflow)
      );
    }

    return combinedData;
  };

  // Helper function to transform API response to dashboard format
  const transformForecastData = (apiResponse: any, scenarioId?: string) => {
    console.log('Transforming forecast data for scenario:', scenarioId);
    console.log('API Response:', apiResponse);

    // Handle both nested and direct forecast structures
    let forecastData = null;

    if (
      apiResponse?.data?.forecast &&
      Array.isArray(apiResponse.data.forecast)
    ) {
      forecastData = apiResponse.data.forecast;
    } else if (apiResponse?.forecast && Array.isArray(apiResponse.forecast)) {
      forecastData = apiResponse.forecast;
    } else {
      console.warn('No forecast data found in API response:', apiResponse);
      return [];
    }

    if (!forecastData || forecastData.length === 0) {
      return [];
    }

    // Use ONLY the actual data from the API response
    // No hardcoded values, no artificial multipliers, no fake calculations
    return forecastData.map((item: any, index: number) => {
      // Use the actual FCF value from API exactly as returned
      const fcfValue = item.value || 0;

      return {
        month: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        date: item.date,
        // Use the actual values from the API response
        net_cash_flow: fcfValue,
        monthly_fcf: fcfValue,
        // Pass through all the actual API data
        forecast_id: item.forecast_id,
        family_id: item.family_id,
        upper: item.upper,
        lower: item.lower,
        // Add scenario info for debugging
        scenario_id: scenarioId,
        baseline_id: apiResponse?.baseline_id,
        metric: apiResponse?.metric,
        organization_id: apiResponse?.organization_id,
        entity_type: apiResponse?.entity_type,
        horizon_months: apiResponse?.horizon_months,
        method_meta: apiResponse?.method_meta,
        // These will be populated by separate API calls for each metric
        cash_balance_beginning: 0, // Will be fetched from API
        cash_balance_end: 0, // Will be calculated from API data
        cash_inflow: 0, // Will be fetched from API
        cash_outflow: 0, // Will be fetched from API
        monthly_revenue: 0, // Will be fetched from API
        monthly_cogs: 0, // Will be fetched from API
        monthly_opex: 0, // Will be fetched from API
        monthly_salary_expense: 0, // Will be fetched from API
        monthly_ocf: 0, // Will be fetched from API
      };
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log(
      'useEffect triggered - selectedScenario:',
      selectedScenario,
      'dateRange:',
      dateRange
    );
    if (selectedScenario && selectedScenario !== 'main') {
      console.log('Loading forecast with scenario:', selectedScenario);
      loadForecastWithScenario();
    } else {
      console.log('Loading base forecast');
      loadBaseForecast();
    }
  }, [selectedScenario, dateRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load scenarios
      const scenariosResponse = await forecastingService.getScenarios(
        organizationId
      );
      setScenarios(scenariosResponse.scenarios);

      // Load base forecast data
      await loadBaseForecast();
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(
        'Failed to load forecast data. Please check your API connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBaseForecast = async () => {
    try {
      console.log(
        'loadBaseForecast called - using comprehensive data fetching'
      );

      // Set loading state immediately
      setLoading(true);
      setError(null);

      // Use the new comprehensive data fetching function
      const comprehensiveData = await fetchComprehensiveForecastData('main');

      console.log('Comprehensive forecast data:', comprehensiveData);

      if (comprehensiveData.length > 0) {
        setForecastData(comprehensiveData);
      } else {
        console.warn('No comprehensive data available from base forecast');
        setForecastData([]);
      }
    } catch (err) {
      console.error('Error loading base forecast:', err);
      setError('Failed to load forecast data from API');
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadForecastWithScenario = async () => {
    try {
      console.log(
        'loadForecastWithScenario called with scenario:',
        selectedScenario
      );

      // Set loading state immediately
      setLoading(true);
      setError(null);

      // Use the new comprehensive data fetching function
      const comprehensiveData = await fetchComprehensiveForecastData(
        selectedScenario
      );

      console.log('Comprehensive scenario forecast data:', comprehensiveData);
      console.log('Data length:', comprehensiveData.length);
      console.log('First item structure:', comprehensiveData[0]);

      if (comprehensiveData.length > 0) {
        console.log('Setting forecast data with comprehensive data...');
        setForecastData(comprehensiveData);
        console.log('Forecast data set successfully');
      } else {
        console.warn('No comprehensive data available from scenario forecast');
        setForecastData([]);
      }
    } catch (err) {
      console.error('Error loading forecast with scenario:', err);
      setError(
        `Failed to load forecast data with scenario '${selectedScenario}' from API`
      );
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = (scenarioId: string) => {
    console.log('Scenario changed to:', scenarioId);

    // Find the selected scenario to check its adjustments
    const selectedScenarioData = scenarios.find(
      (s) => s.scenario_id === scenarioId
    );
    if (selectedScenarioData) {
      console.log('=== SELECTED SCENARIO DATA ===');
      console.log('Scenario ID:', selectedScenarioData.scenario_id);
      console.log('Scenario Name:', selectedScenarioData.name);
      console.log('Scenario Notes:', selectedScenarioData.notes);
      console.log(
        'Number of adjustments:',
        selectedScenarioData.adjustments.length
      );
      console.log('Adjustments:', selectedScenarioData.adjustments);

      if (selectedScenarioData.adjustments.length > 0) {
        console.log('=== ADJUSTMENT DETAILS ===');
        selectedScenarioData.adjustments.forEach((adj, index) => {
          console.log(`Adjustment ${index + 1}:`, {
            target_metric: adj.target_metric,
            rule_type: adj.rule_type,
            value_expr: adj.value_expr,
            priority: adj.priority,
          });
        });
      } else {
        console.log(
          '⚠️ NO ADJUSTMENTS FOUND - This scenario will show same data as main scenario'
        );
      }
    }

    setSelectedScenario(scenarioId);
    // Clear old data immediately to prevent showing stale data
    setForecastData([]);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleViewModeChange = (mode: 'consolidated' | 'detailed') => {
    setViewMode(mode);
  };

  const handleNewScenario = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateScenario = async (scenarioData: {
    name: string;
    start_date: string;
    end_date: string;
    notes: string;
  }) => {
    try {
      const newScenario = await forecastingService.createScenario({
        name: scenarioData.name,
        start_date: scenarioData.start_date,
        end_date: scenarioData.end_date,
        notes:
          scenarioData.notes || `Created on ${new Date().toLocaleDateString()}`,
      });
      // Reload scenarios to include the new one
      const scenariosResponse = await forecastingService.getScenarios(
        'organization',
        organizationId
      );
      setScenarios(scenariosResponse.scenarios);

      // Select the new scenario
      setSelectedScenario(newScenario.scenario_id || newScenario.id);

      console.log('New scenario created:', newScenario);
    } catch (error) {
      console.error('Error creating new scenario:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleAddAdjustment = () => {
    if (selectedScenario === 'main') {
      alert(
        'Cannot add adjustments to the main scenario. Please select a custom scenario first.'
      );
      return;
    }
    setIsAdjustmentModalOpen(true);
  };

  const handleEditScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.scenario_id === scenarioId);
    if (scenario) {
      setEditingScenario(scenario);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.scenario_id === scenarioId);
    if (scenario) {
      setDeletingScenario(scenario);
      setIsDeleteModalOpen(true);
    }
  };

  const handleUpdateScenario = async (scenarioData: {
    name: string;
    start_date: string;
    end_date: string;
    notes: string;
  }) => {
    if (!editingScenario) return;

    try {
      // TODO: Implement update scenario API call
      console.log(
        'Updating scenario:',
        editingScenario.scenario_id,
        scenarioData
      );

      // For now, just update the local state
      setScenarios((prev) =>
        prev.map((s) =>
          s.scenario_id === editingScenario.scenario_id
            ? { ...s, name: scenarioData.name, notes: scenarioData.notes }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingScenario) return;

    try {
      await forecastingService.deleteScenario(deletingScenario.scenario_id);

      // Remove from local state
      setScenarios((prev) =>
        prev.filter((s) => s.scenario_id !== deletingScenario.scenario_id)
      );

      // If the deleted scenario was selected, switch to main
      if (selectedScenario === deletingScenario.scenario_id) {
        setSelectedScenario('main');
      }

      console.log('Scenario deleted:', deletingScenario.scenario_id);
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  };

  const handleExport = () => {
    // Export to Excel functionality
    const csvContent = generateCSVContent(forecastArray);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `cashflow-forecast-${selectedScenario}-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    if (selectedScenario === 'main') {
      loadBaseForecast();
    } else {
      loadForecastWithScenario();
    }
  };

  const generateCSVContent = (data: any[]) => {
    if (!data || data.length === 0) return '';

    const headers = [
      'Date',
      'Month',
      'Cash Balance Beginning',
      'Cash Inflow',
      'Cash Outflow',
      'Net Cash Flow',
      'Cash Balance End',
      'FCF',
      'Revenue',
      'COGS',
      'OPEX',
      'Salary Expense',
      'OCF',
    ];

    const rows = data.map((item) => [
      item.date,
      item.month,
      item.cash_balance_beginning,
      item.cash_inflow,
      item.cash_outflow,
      item.net_cash_flow,
      item.cash_balance_end,
      item.monthly_fcf,
      item.monthly_revenue,
      item.monthly_cogs,
      item.monthly_opex,
      item.monthly_salary_expense,
      item.monthly_ocf,
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const handleCreateAdjustment = async (adjustmentData: {
    target_metric: string;
    rule_type: string;
    value_expr: string;
    priority: number;
  }) => {
    try {
      await forecastingService.addAdjustment(selectedScenario, {
        target_metric: adjustmentData.target_metric,
        organization_id: organizationId,
        rule_type: adjustmentData.rule_type,
        value_expr: adjustmentData.value_expr,
        priority: adjustmentData.priority,
      });

      // Reload scenarios to get updated adjustments
      const scenariosResponse = await forecastingService.getScenarios(
        organizationId
      );
      setScenarios(scenariosResponse.scenarios);

      console.log('Adjustment added successfully');
    } catch (error) {
      console.error('Error adding adjustment:', error);
      throw error;
    }
  };

  // Calculate key metrics
  const forecastArray = Array.isArray(forecastData) ? forecastData : [];

  console.log('Current forecastData state:', forecastData);
  console.log('Current forecastArray length:', forecastArray.length);
  console.log('Current selectedScenario:', selectedScenario);

  // Show the current balance (use the first month's ending balance as current balance)
  const currentCashBalance =
    forecastArray.length > 0 ? forecastArray[0]?.cash_balance_end || 0 : 0;

  console.log('=== CURRENT BALANCE CALCULATION ===');
  console.log('Forecast array length:', forecastArray.length);
  console.log('First item:', forecastArray[0]);
  console.log(
    'First item cash_balance_beginning:',
    forecastArray[0]?.cash_balance_beginning
  );
  console.log(
    'First item cash_balance_end:',
    forecastArray[0]?.cash_balance_end
  );
  console.log('Calculated currentCashBalance:', currentCashBalance);

  // Calculate projected end balance (last period's ending balance)
  const projectedEndBalance =
    forecastArray.length > 0
      ? forecastArray[forecastArray.length - 1]?.cash_balance_end ||
        currentCashBalance
      : currentCashBalance;

  const totalInflow = forecastArray.reduce(
    (sum, item) => sum + (item?.cash_inflow || 0),
    0
  );
  const totalOutflow = forecastArray.reduce(
    (sum, item) => sum + (item?.cash_outflow || 0),
    0
  );
  const netCashFlow = totalInflow - totalOutflow;

  if (loading) {
    return (
      <RootLayout>
        <div
          className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'}`}
        >
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 w-1/4 mb-6"></div>
              <div className="h-32 bg-gray-200 mb-6"></div>
              <div className="h-96 bg-gray-200 mb-6"></div>
              <div className="h-64 bg-gray-200"></div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'}`}>
        <div className="p-6 space-y-6 print:p-4 print:space-y-4">
          {/* Header with controls */}
          <ForecastHeader
            selectedScenario={selectedScenario}
            scenarios={scenarios}
            dateRange={dateRange}
            viewMode={viewMode}
            onScenarioChange={handleScenarioChange}
            onDateRangeChange={handleDateRangeChange}
            onViewModeChange={handleViewModeChange}
            onNewScenario={handleNewScenario}
            onAddAdjustment={handleAddAdjustment}
            onEditScenario={handleEditScenario}
            onDeleteScenario={handleDeleteScenario}
            onExport={handleExport}
            onPrint={handlePrint}
            onRefresh={handleRefresh}
            isLoading={loading}
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-1">
                Please check your API connection.
              </p>
            </div>
          )}

          {/* Key metric card */}
          {loading ? (
            <SkeletonCard />
          ) : (
            <CashBalanceCard
              key={`cash-balance-${selectedScenario}`}
              currentBalance={currentCashBalance}
              projectedEndBalance={projectedEndBalance}
              netCashFlow={netCashFlow}
              totalInflow={totalInflow}
              totalOutflow={totalOutflow}
            />
          )}

          {/* Main chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <ForecastChart
              key={`forecast-chart-${selectedScenario}`}
              data={forecastArray}
              viewMode={viewMode}
            />
          )}

          {/* Data table */}
          {loading ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <SkeletonLoader height="h-6" width="w-1/3" />
                <SkeletonTable rows={8} cols={6} />
              </div>
            </div>
          ) : (
            <ForecastTable
              key={`forecast-table-${selectedScenario}`}
              data={forecastArray}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Create Scenario Modal */}
      <CreateScenarioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateScenario}
        dateRange={dateRange}
        organizationId={organizationId}
      />

      {/* Edit Scenario Modal */}
      <EditScenarioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingScenario(null);
        }}
        onSubmit={handleUpdateScenario}
        scenario={editingScenario}
        organizationId={organizationId}
      />

      {/* Delete Scenario Modal */}
      <DeleteScenarioModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingScenario(null);
        }}
        onConfirm={handleConfirmDelete}
        scenarioName={deletingScenario?.name || ''}
      />

      {/* Add Adjustment Modal */}
      <AddAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSubmit={handleCreateAdjustment}
        organizationId={organizationId}
        currentScenario={
          selectedScenario !== 'main'
            ? scenarios.find((s) => s.scenario_id === selectedScenario)
            : null
        }
      />
    </RootLayout>
  );
};

export default CashFlowPage;
