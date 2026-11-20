'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  pottaAnalyticsService,
  KpiCalculationRequest,
} from '../../../../services/analyticsService';

interface KpiCardProps {
  kpiName: string;
  displayName: string;
  category: string;
  timeGranularity?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  useMockData?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  kpiName,
  displayName,
  category,
  timeGranularity = 'monthly',
  organizationId,
  startDate,
  endDate,
  useMockData = true,
}) => {
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        setError(null);

        const request: KpiCalculationRequest = {
          kpi_name: kpiName,
          organization_id: organizationId || 'default',
          time_granularity: timeGranularity,
          start_date: startDate,
          end_date: endDate,
          use_mock_data: useMockData,
        };

        console.log(`Fetching KPI ${kpiName}:`, request);

        const response = await pottaAnalyticsService.kpi.calculateKpi(request);

        console.log(`KPI ${kpiName} response:`, response);

        if (response.results && response.results.length > 0) {
          setKpiData(response.results[0]);
        } else {
          console.warn(`KPI ${kpiName} returned no results:`, response);
          setError('No KPI data available');
        }
      } catch (err) {
        console.error(`Error fetching KPI ${kpiName}:`, err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch KPI data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [
    kpiName,
    timeGranularity,
    organizationId,
    startDate,
    endDate,
    useMockData,
  ]);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency' || unit === 'money') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'FCFA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'up':
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      financial: 'bg-blue-100 text-blue-800',
      sales_revenue: 'bg-green-100 text-green-800',
      human_capital: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800',
      inventory_supply_chain: 'bg-yellow-100 text-yellow-800',
      project_costing: 'bg-indigo-100 text-indigo-800',
      planning_performance: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{displayName}</CardTitle>
          <span
            className={`inline-flex items-center px-2.5 py-0.5  text-xs font-medium ${getCategoryColor(
              category
            )}`}
          >
            {category.replace('_', ' ').toUpperCase()}
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading KPI</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{displayName}</CardTitle>
          {getTrendIcon(kpiData?.calculation_details?.trend)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 w-fit text-xs font-medium ${getCategoryColor(
              category
            )}`}
          >
            {category.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-medium text-gray-900">
              {kpiData?.value !== undefined && kpiData?.value !== null
                ? formatValue(kpiData.value, kpiData?.unit || 'number')
                : 'No data available'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {kpiData?.period || 'Current Period'}
            </div>
          </div>

          {kpiData?.calculation_details && (
            <div className="space-y-2">
              {kpiData.calculation_details.trend && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <span
                    className={`font-medium ${
                      kpiData.calculation_details.trend === 'up'
                        ? 'text-green-600'
                        : kpiData.calculation_details.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {kpiData.calculation_details.trend === 'up'
                      ? '↗'
                      : kpiData.calculation_details.trend === 'down'
                      ? '↘'
                      : '→'}
                    {kpiData.calculation_details.trend}
                  </span>
                </div>
              )}

              {kpiData.calculation_details.previous_value && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Previous:</span>
                  <span className="font-medium">
                    {formatValue(
                      kpiData.calculation_details.previous_value,
                      kpiData.unit || 'number'
                    )}
                  </span>
                </div>
              )}

              {kpiData.calculation_details.change_percentage && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Change:</span>
                  <span
                    className={`font-medium ${
                      kpiData.calculation_details.change_percentage > 0
                        ? 'text-green-600'
                        : kpiData.calculation_details.change_percentage < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {kpiData.calculation_details.change_percentage > 0
                      ? '+'
                      : ''}
                    {kpiData.calculation_details.change_percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
