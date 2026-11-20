'use client';
import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  Download,
  Printer,
  RefreshCw,
} from 'lucide-react';
import type { Scenario } from '../../../../../services/forecastingService';
import CustomDateRangePicker from './CustomDateRangePicker';
import Button from '@potta/components/button';

interface ForecastHeaderProps {
  selectedScenario: string;
  scenarios: Scenario[];
  dateRange: { start: Date; end: Date };
  viewMode: 'consolidated' | 'detailed';
  onScenarioChange: (scenarioId: string) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
  onViewModeChange: (mode: 'consolidated' | 'detailed') => void;
  onNewScenario?: () => void;
  onAddAdjustment?: () => void;
  onEditScenario?: (scenarioId: string) => void;
  onDeleteScenario?: (scenarioId: string) => void;
  onExport?: () => void;
  onPrint?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const ForecastHeader: React.FC<ForecastHeaderProps> = ({
  selectedScenario,
  scenarios,
  dateRange,
  viewMode,
  onScenarioChange,
  onDateRangeChange,
  onViewModeChange,
  onNewScenario,
  onAddAdjustment,
  onEditScenario,
  onDeleteScenario,
  onExport,
  onPrint,
  onRefresh,
  isLoading = false,
}) => {
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const handleNewScenarioClick = () => {
    onNewScenario?.();
  };

  const formatDateRange = (): string => {
    const startMonth = dateRange.start.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const endMonth = dateRange.end.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    return `${startMonth} → ${endMonth}`;
  };

  const getSelectedScenarioName = () => {
    if (selectedScenario === 'main') return 'Main scenario';
    const scenario = scenarios.find((s) => s.scenario_id === selectedScenario);
    return scenario ? scenario.name : 'Main scenario';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-2 py-4">
      {/* Top section with controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Left side - Title */}
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-medium text-gray-900">
            Cash Flow Forecast
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 print:hidden">
          {/* Export/Print/Refresh buttons */}
          {/* <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Export to Excel"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={onPrint}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Print Report"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button> */}

          {selectedScenario !== 'main' && onAddAdjustment && (
            <Button
              onClick={onAddAdjustment}
              text="Add Adjustment"
              color={true}
              type="button"
theme='outline'
            />
           
          )}

          <button
            onClick={handleNewScenarioClick}
            className="flex items-center px-3 py-2 bg-green-800 text-white hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </button>
        </div>
      </div>

      {/* Bottom section with filters */}
      <div className="flex items-center justify-between print:hidden">
        {/* Left side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Scenario selector */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {getSelectedScenarioName()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showScenarioDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200  shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onScenarioChange('main');
                      setShowScenarioDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm  transition-colors ${
                      selectedScenario === 'main'
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Main scenario
                  </button>
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.scenario_id}
                      className={`w-full px-3 py-2 text-sm transition-colors ${
                        selectedScenario === scenario.scenario_id
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            onScenarioChange(scenario.scenario_id);
                            setShowScenarioDropdown(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <div>
                            <div className="font-medium">{scenario.name}</div>
                            {scenario.notes && (
                              <div className="text-xs text-gray-500 truncate">
                                {scenario.notes}
                              </div>
                            )}
                            {scenario.adjustments.length > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                {scenario.adjustments.length} adjustment
                                {scenario.adjustments.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </button>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => {
                              onEditScenario?.(scenario.scenario_id);
                              setShowScenarioDropdown(false);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit scenario"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteScenario?.(scenario.scenario_id);
                              setShowScenarioDropdown(false);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete scenario"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Range Picker */}
          <CustomDateRangePicker
            dateRange={dateRange}
            setDateRange={(range) => onDateRangeChange(range.start, range.end)}
          />
        </div>

        {/* Right side - View mode */}
        <div className="relative">
          {showViewDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200  shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => {
                    onViewModeChange('consolidated');
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm  transition-colors ${
                    viewMode === 'consolidated'
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Consolidated view
                </button>
                <button
                  onClick={() => {
                    onViewModeChange('detailed');
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm  transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Detailed view
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastHeader;
