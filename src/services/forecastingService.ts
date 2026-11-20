import analyticsAxios from '../config/analytics.config';

// Types for Forecasting API
export interface BaselineRunRequest {
  metric: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  horizon_months: number;
}

export interface BaselineRunResponse {
  baseline_id: string;
  metric: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  horizon_months: number;
  method_meta: Record<string, any>;
  forecast: Record<string, any>[];
}

export interface Scenario {
  scenario_id: string;
  name: string;
  start_date: string;
  end_date: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  notes: string;
  created_ts: string;
  adjustments: Adjustment[];
}

export interface Adjustment {
  driver_id: string;
  target_metric: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  rule_type: string;
  value_expr: string;
  priority: number;
}

export interface CreateScenarioRequest {
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export interface CreateAdjustmentRequest {
  target_metric: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  rule_type: string;
  value_expr: string;
  priority: number;
}

export interface LaunchForecastRequest {
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  scenario_id?: string;
  metric: string;
  horizon_months: number;
}

export interface ScenariosResponse {
  scenarios: Scenario[];
}

// Forecasting Service Class
class ForecastingService {
  private basePath = '/api/forecast/v1';

  // Baseline Runs
  async createBaselineRun(
    request: BaselineRunRequest
  ): Promise<BaselineRunResponse> {
    try {
      const response = await analyticsAxios.post(
        `${this.basePath}/baseline/runs`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating baseline run:', error);
      throw error;
    }
  }

  // Scenarios
  async getScenarios(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false
  ): Promise<ScenariosResponse> {
    try {
      const params: any = {
        entity_type: entityType,
        entity_id: entityId,
        include_children: includeChildren,
      };

      const response = await analyticsAxios.get(`${this.basePath}/scenarios`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
  }

  async createScenario(request: CreateScenarioRequest): Promise<any> {
    try {
      const response = await analyticsAxios.post(
        `${this.basePath}/scenarios`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  }

  async getScenario(
    scenarioId: string,
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false
  ): Promise<Scenario> {
    try {
      const response = await analyticsAxios.get(
        `${this.basePath}/scenarios/${scenarioId}`,
        {
          params: {
            entity_type: entityType,
            entity_id: entityId,
            include_children: includeChildren,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching scenario:', error);
      throw error;
    }
  }

  async updateScenario(
    scenarioId: string,
    request: CreateScenarioRequest
  ): Promise<any> {
    try {
      const response = await analyticsAxios.put(
        `${this.basePath}/scenarios/${scenarioId}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  }

  async deleteScenario(
    scenarioId: string,
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false
  ): Promise<any> {
    try {
      const response = await analyticsAxios.delete(
        `${this.basePath}/scenarios/${scenarioId}`,
        {
          params: {
            entity_type: entityType,
            entity_id: entityId,
            include_children: includeChildren,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  }

  // Adjustments
  async addAdjustment(
    scenarioId: string,
    request: CreateAdjustmentRequest
  ): Promise<any> {
    try {
      const response = await analyticsAxios.post(
        `${this.basePath}/scenarios/${scenarioId}/adjustments`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error adding adjustment:', error);
      throw error;
    }
  }

  async deleteAdjustment(
    driverId: string,
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false
  ): Promise<any> {
    try {
      const response = await analyticsAxios.delete(
        `${this.basePath}/scenarios/adjustments/${driverId}`,
        {
          params: {
            entity_type: entityType,
            entity_id: entityId,
            include_children: includeChildren,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      throw error;
    }
  }

  // Launch Forecast
  async launchForecast(request: LaunchForecastRequest): Promise<any> {
    try {
      const response = await analyticsAxios.post(
        `${this.basePath}/launch`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error launching forecast:', error);
      throw error;
    }
  }

  // Metric mapping for API compatibility - NEW FORMAT (left side is what we send to API)
  private metricMapping = {
    revenue: 'revenue',
    cogs: 'cogs',
    opex: 'opex',
    salary_expense: 'salary_expense',
    tax: 'tax',
    gross_profit: 'gross_profit',
    operating_profit: 'operating_profit',
    net_income: 'net_income',
    gross_profit_margin: 'gross_profit_margin',
    operating_margin: 'operating_margin',
    net_profit_margin: 'net_profit_margin',
    ocf: 'ocf',
    capex: 'capex',
    fcf: 'fcf',
  };

  // Helper methods for common use cases
  async getCashFlowForecast(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false,
    scenarioId?: string,
    horizonMonths: number = 18
  ): Promise<any> {
    try {
      const request: LaunchForecastRequest = {
        entity_type: entityType,
        entity_id: entityId,
        include_children: includeChildren,
        metric: this.metricMapping.fcf, // Free Cash Flow from schema
        horizon_months: horizonMonths,
        ...(scenarioId && scenarioId !== 'main' && { scenario_id: scenarioId }),
      };

      return await this.launchForecast(request);
    } catch (error) {
      console.error('Error getting cash flow forecast:', error);
      throw error;
    }
  }

  async getRevenueBaseline(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false,
    horizonMonths: number = 18
  ): Promise<BaselineRunResponse> {
    try {
      const request: BaselineRunRequest = {
        metric: this.metricMapping.revenue,
        entity_type: entityType,
        entity_id: entityId,
        include_children: includeChildren,
        horizon_months: horizonMonths,
      };

      return await this.createBaselineRun(request);
    } catch (error) {
      console.error('Error getting revenue baseline:', error);
      throw error;
    }
  }

  // Helper method to get forecast for specific metrics
  async getMetricForecast(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false,
    metric: keyof typeof this.metricMapping,
    scenarioId?: string,
    horizonMonths: number = 18
  ): Promise<any> {
    try {
      const request: LaunchForecastRequest = {
        entity_type: entityType,
        entity_id: entityId,
        include_children: includeChildren,
        metric: this.metricMapping[metric],
        horizon_months: horizonMonths,
        ...(scenarioId && scenarioId !== 'main' && { scenario_id: scenarioId }),
      };

      return await this.launchForecast(request);
    } catch (error) {
      console.error(`Error getting ${metric} forecast:`, error);
      throw error;
    }
  }

  // Helper method to create baseline for specific metrics
  async getMetricBaseline(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false,
    metric: keyof typeof this.metricMapping,
    horizonMonths: number = 18
  ): Promise<BaselineRunResponse> {
    try {
      const request: BaselineRunRequest = {
        metric: this.metricMapping[metric],
        entity_type: entityType,
        entity_id: entityId,
        include_children: includeChildren,
        horizon_months: horizonMonths,
      };

      return await this.createBaselineRun(request);
    } catch (error) {
      console.error(`Error getting ${metric} baseline:`, error);
      throw error;
    }
  }

  // Get comprehensive cash flow forecast with multiple metrics
  async getComprehensiveCashFlowForecast(
    entityType: 'location' | 'organization',
    entityId: string,
    includeChildren: boolean = false,
    scenarioId?: string,
    horizonMonths: number = 18
  ): Promise<any> {
    try {
      if (scenarioId && scenarioId !== 'main') {
        // For custom scenarios, use launch forecast
        const launchRequest: LaunchForecastRequest = {
          entity_type: entityType,
          entity_id: entityId,
          include_children: includeChildren,
          metric: this.metricMapping.fcf,
          horizon_months: horizonMonths,
          scenario_id: scenarioId,
        };

        const launchResponse = await this.launchForecast(launchRequest);
        return launchResponse;
      } else {
        // For main scenario, use baseline run
        const baselineRequest: BaselineRunRequest = {
          metric: this.metricMapping.fcf,
          entity_type: entityType,
          entity_id: entityId,
          include_children: includeChildren,
          horizon_months: horizonMonths,
        };

        const baselineResponse = await this.createBaselineRun(baselineRequest);
        return baselineResponse;
      }
    } catch (error) {
      console.error('Error getting comprehensive cash flow forecast:', error);
      throw error;
    }
  }

  // Utility method to validate metric names
  isValidMetric(metric: string): metric is keyof typeof this.metricMapping {
    return metric in this.metricMapping;
  }

  // Get available metrics
  getAvailableMetrics(): string[] {
    return Object.keys(this.metricMapping);
  }
}

export const forecastingService = new ForecastingService();
export default forecastingService;
