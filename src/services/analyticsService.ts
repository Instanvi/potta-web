import analyticsAxios from '../config/analytics.config';

// Base types for the new Potta FP&A Metrics API
export interface FactTable {
  name: string;
  display_name: string;
  metrics: string[];
  dimensions: string[];
}

export interface AnalyticsQuery {
  fact: string;
  metrics: string[];
  dimensions: string[];
  time_granularity?: string;
  filters?: Record<string, any>;
  date_range?: Record<string, any>;
}

export interface AnalyticsResponse {
  query: AnalyticsQuery;
  data: Record<string, any>[];
  metadata: {
    row_count: number;
    columns: string[];
  };
}

export interface TrendsResponse {
  metric: string;
  time_granularity: string;
  data_points: Array<{
    period: string;
    value: number;
  }>;
}

export interface ComparisonResponse {
  metric: string;
  compare_by: string;
  comparison: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

export interface KpiResponse {
  kpi_name: string;
  display_name: string;
  category: string;
  value: number;
  unit: string;
  period: string;
  calculation_details: Record<string, any>;
  metadata: Record<string, any>;
}

export interface KpiCalculationRequest {
  kpi_name: string;
  entity_type: 'location' | 'organization';
  entity_id: string;
  include_children: boolean;
  time_granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  end_date?: string;
  filters?: Record<string, any>;
  use_mock_data?: boolean;
}

export interface KpiCalculationResponse {
  request: Record<string, any>;
  results: KpiResponse[];
  metadata: Record<string, any>;
}

export interface KpiCategory {
  name: string;
  display_name: string;
}

export interface KpiDefinition {
  name: string;
  display_name: string;
  description: string;
  category: string;
  formula_description: string;
  required_facts: string[];
  required_dimensions: string[];
}

export interface KpiCategoriesResponse {
  categories: KpiCategory[];
}

export interface KpiAvailableResponse {
  kpis: KpiDefinition[];
}

export interface AnalyticsOptions {
  metrics?: string[];
  dimensions?: string[];
  time_granularity?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  end_date?: string;
  entity_type?: 'location' | 'organization';
  entity_id?: string;
  include_children?: boolean;
  account_uuid?: string;
  product_uuid?: string;
  customer_uuid?: string;
  vendor_uuid?: string;
  role_id?: string;
  employee_id?: string;
  employment_type?: string;
  use_mock_data?: boolean;
  location_id?: string;
  organization_id?: string;
}

export interface TrendsOptions {
  metric?: string;
  time_granularity?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  periods?: number;
}

export interface ComparisonOptions {
  metric?: string;
  compare_by?: string;
}

// Base Analytics Service Class
abstract class BaseAnalyticsService {
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await analyticsAxios.get(`${this.basePath}${endpoint}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      throw error;
    }
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await analyticsAxios.post(
        `${this.basePath}${endpoint}`,
        data,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      throw error;
    }
  }

  async getAvailableFacts(): Promise<Record<string, FactTable[]>> {
    return this.get('/facts');
  }

  async getAvailableDimensions(fact?: string): Promise<string[]> {
    const params = fact ? { fact } : {};
    return this.get('/dimensions', params);
  }

  async getAnalytics(
    factName: string,
    options: AnalyticsOptions = {}
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();

    if (options.metrics) {
      params.append('metrics', options.metrics.join(','));
    }
    if (options.dimensions) {
      params.append('dimensions', options.dimensions.join(','));
    }
    if (options.time_granularity) {
      params.append('time_granularity', options.time_granularity);
    }
    if (options.start_date) {
      params.append('start_date', options.start_date);
    }
    if (options.end_date) {
      params.append('end_date', options.end_date);
    }
    if (options.entity_type) {
      params.append('entity_type', options.entity_type);
    }
    if (options.entity_id) {
      params.append('entity_id', options.entity_id);
    }
    if (options.include_children !== undefined) {
      params.append('include_children', options.include_children.toString());
    }
    if (options.account_uuid) {
      params.append('account_uuid', options.account_uuid);
    }
    if (options.product_uuid) {
      params.append('product_uuid', options.product_uuid);
    }
    if (options.customer_uuid) {
      params.append('customer_uuid', options.customer_uuid);
    }
    if (options.vendor_uuid) {
      params.append('vendor_uuid', options.vendor_uuid);
    }
    if (options.role_id) {
      params.append('role_id', options.role_id);
    }
    if (options.employee_id) {
      params.append('employee_id', options.employee_id);
    }
    if (options.employment_type) {
      params.append('employment_type', options.employment_type);
    }
    if (options.use_mock_data !== undefined) {
      params.append('use_mock_data', options.use_mock_data.toString());
    }
    if (options.location_id) {
      params.append('location_id', options.location_id);
    }
    if (options.organization_id) {
      params.append('organization_id', options.organization_id);
    }

    console.log(
      `🔍 Making ${
        this.constructor.name
      } request to: /${factName}?${params.toString()}`
    );

    return this.get(`/${factName}?${params.toString()}`);
  }

  async getTrends(
    factName: string,
    options: TrendsOptions = {}
  ): Promise<TrendsResponse> {
    const params: Record<string, any> = {};

    if (options.metric) {
      params.metric = options.metric;
    }
    if (options.time_granularity) {
      params.time_granularity = options.time_granularity;
    }
    if (options.periods) {
      params.periods = options.periods;
    }

    return this.get(`/${factName}/trends`, params);
  }

  async getComparison(
    factName: string,
    options: ComparisonOptions = {}
  ): Promise<ComparisonResponse> {
    const params: Record<string, any> = {};

    if (options.metric) {
      params.metric = options.metric;
    }
    if (options.compare_by) {
      params.compare_by = options.compare_by;
    }

    return this.get(`/${factName}/comparison`, params);
  }
}

// Finance Analytics Service
class FinanceAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super('/api/finance/v1');
  }

  async getAvailableKpis(): Promise<Record<string, any>> {
    return this.get('/kpis');
  }

  async calculateKpi(
    kpiName: string,
    options: {
      time_granularity?:
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'quarterly'
        | 'yearly';
      entity_type?: 'location' | 'organization';
      entity_id?: string;
      include_children?: boolean;
      start_date?: string;
      end_date?: string;
      dimensions?: string;
      use_mock_data?: boolean;
    } = {}
  ): Promise<any> {
    const params: Record<string, any> = {};

    if (options.time_granularity) {
      params.time_granularity = options.time_granularity;
    }
    if (options.entity_type) {
      params.entity_type = options.entity_type;
    }
    if (options.entity_id) {
      params.entity_id = options.entity_id;
    }
    if (options.include_children !== undefined) {
      params.include_children = options.include_children;
    }
    if (options.start_date) {
      params.start_date = options.start_date;
    }
    if (options.end_date) {
      params.end_date = options.end_date;
    }
    if (options.dimensions) {
      params.dimensions = options.dimensions;
    }
    if (options.use_mock_data !== undefined) {
      params.use_mock_data = options.use_mock_data;
    }

    return this.post(`/kpis/${kpiName}`, undefined, params);
  }

  // Helper methods for common finance use cases
  async getRevenueData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('revenue', {
      metrics: ['total_revenue'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getExpenseData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('opex', {
      metrics: ['total_opex_amount'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getCogsData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('cogs', {
      metrics: ['total_cost'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getNetIncomeData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('net_income', {
      metrics: ['net_income_after_tax'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getArBalanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('ar_balance', {
      metrics: ['customer_running_balance'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getApBalanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('ap_balance', {
      metrics: ['vendor_running_balance'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }
}

// Human Capital Analytics Service
class HumanCapitalAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super('/api/human-capital/v1');
  }

  async getAvailableKpis(): Promise<Record<string, any>> {
    return this.get('/kpis');
  }

  async calculateKpi(
    kpiName: string,
    options: {
      time_granularity?:
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'quarterly'
        | 'yearly';
      entity_type?: 'location' | 'organization';
      entity_id?: string;
      include_children?: boolean;
      start_date?: string;
      end_date?: string;
      use_mock_data?: boolean;
    } = {}
  ): Promise<any> {
    const params: Record<string, any> = {};

    if (options.time_granularity) {
      params.time_granularity = options.time_granularity;
    }
    if (options.entity_type) {
      params.entity_type = options.entity_type;
    }
    if (options.entity_id) {
      params.entity_id = options.entity_id;
    }
    if (options.include_children !== undefined) {
      params.include_children = options.include_children;
    }
    if (options.start_date) {
      params.start_date = options.start_date;
    }
    if (options.end_date) {
      params.end_date = options.end_date;
    }
    if (options.use_mock_data !== undefined) {
      params.use_mock_data = options.use_mock_data;
    }

    return this.post(`/kpis/${kpiName}`, undefined, params);
  }

  // Helper methods for common human capital use cases
  async getHeadcountData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('headcount', {
      metrics: ['headcount', 'total_fte'],
      dimensions: ['time', 'role'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getPayrollData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('salary_expenses_monthly', {
      metrics: ['total_salary_expense', 'cost_per_fte'],
      dimensions: ['time', 'role'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getEmployeeData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('headcount', {
      metrics: ['headcount'],
      dimensions: ['time', 'role', 'organization'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getSalaryExpensesData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('salary_expenses', {
      metrics: ['gross_salary', 'base_pay'],
      dimensions: ['time', 'role'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getBenefitExpensesData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('benefit_expenses_monthly', {
      metrics: ['benefit_amount', 'value'],
      dimensions: ['time', 'role'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }
}

// Sales & Inventory Analytics Service
class SalesInventoryAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super('/api/sales-inventory/v1');
  }

  async getAvailableKpis(): Promise<Record<string, any>> {
    return this.get('/kpis');
  }

  async calculateKpi(
    kpiName: string,
    options: {
      time_granularity?:
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'quarterly'
        | 'yearly';
      entity_type?: 'location' | 'organization';
      entity_id?: string;
      include_children?: boolean;
      start_date?: string;
      end_date?: string;
      dimensions?: string;
      use_mock_data?: boolean;
    } = {}
  ): Promise<any> {
    const params: Record<string, any> = {};

    if (options.time_granularity) {
      params.time_granularity = options.time_granularity;
    }
    if (options.entity_type) {
      params.entity_type = options.entity_type;
    }
    if (options.entity_id) {
      params.entity_id = options.entity_id;
    }
    if (options.include_children !== undefined) {
      params.include_children = options.include_children;
    }
    if (options.start_date) {
      params.start_date = options.start_date;
    }
    if (options.end_date) {
      params.end_date = options.end_date;
    }
    if (options.dimensions) {
      params.dimensions = options.dimensions;
    }
    if (options.use_mock_data !== undefined) {
      params.use_mock_data = options.use_mock_data;
    }

    return this.post(`/kpis/${kpiName}`, {}, params);
  }

  // Helper methods for common sales & inventory use cases
  async getSalesData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('units_sold', {
      metrics: ['total_units_sold', 'total_revenue'],
      dimensions: ['time', 'product'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getSalesPerformanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('sales_performance', {
      metrics: [
        'total_units_sold',
        'total_revenue',
        'average_order_value',
        'conversion_rate',
      ],
      dimensions: ['time', 'product', 'customer'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getNewCustomersData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('new_customers', {
      metrics: ['new_customers'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getPurchasesData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('units_purchased', {
      metrics: ['total_units_purchased', 'total_cost'],
      dimensions: ['time', 'product', 'vendor'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  // Additional inventory-specific methods
  async getInventoryBalanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('units_sold', {
      metrics: ['total_units_sold'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getCogsData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.getAnalytics('units_purchased', {
      metrics: ['total_cost'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getSalesRevenueData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    // NOTE: sales_performance fact table may cause 400 errors - handle gracefully in components
    return this.getAnalytics('sales_performance', {
      metrics: ['total_revenue'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }
}

// KPI Service
class KpiService {
  private basePath = '/api/kpi/v1';

  async getAvailableKpis(category?: string): Promise<KpiAvailableResponse> {
    const params = category ? { category } : {};
    try {
      const response = await analyticsAxios.get(`${this.basePath}/available`, {
        params,
      });
      console.log('KPI Available response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available KPIs:', error);
      return { kpis: [] };
    }
  }

  async getKpiCategories(): Promise<KpiCategoriesResponse> {
    try {
      const response = await analyticsAxios.get(`${this.basePath}/categories`);
      console.log('KPI Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI categories:', error);
      return { categories: [] };
    }
  }

  async calculateKpi(
    request: KpiCalculationRequest
  ): Promise<KpiCalculationResponse> {
    return analyticsAxios
      .post(`${this.basePath}/calculate`, request)
      .then((res) => res.data);
  }

  async calculateMultipleKpis(
    kpiNames: string[],
    options: {
      entity_type?: 'location' | 'organization';
      entity_id?: string;
      include_children?: boolean;
      time_granularity?:
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'quarterly'
        | 'yearly';
      start_date?: string;
      end_date?: string;
      use_mock_data?: boolean;
    } = {}
  ): Promise<KpiCalculationResponse> {
    const params: Record<string, any> = {};

    if (options.entity_type) {
      params.entity_type = options.entity_type;
    }
    if (options.entity_id) {
      params.entity_id = options.entity_id;
    }
    if (options.include_children !== undefined) {
      params.include_children = options.include_children;
    }
    if (options.time_granularity) {
      params.time_granularity = options.time_granularity;
    }
    if (options.start_date) {
      params.start_date = options.start_date;
    }
    if (options.end_date) {
      params.end_date = options.end_date;
    }
    if (options.use_mock_data !== undefined) {
      params.use_mock_data = options.use_mock_data;
    }

    return analyticsAxios
      .post(`${this.basePath}/calculate-multiple`, kpiNames, { params })
      .then((res) => res.data);
  }
}

// Main Analytics Service that combines all modules
class PottaAnalyticsService {
  public finance: FinanceAnalyticsService;
  public humanCapital: HumanCapitalAnalyticsService;
  public salesInventory: SalesInventoryAnalyticsService;
  public kpi: KpiService;

  constructor() {
    this.finance = new FinanceAnalyticsService();
    this.humanCapital = new HumanCapitalAnalyticsService();
    this.salesInventory = new SalesInventoryAnalyticsService();
    this.kpi = new KpiService();
  }

  // Legacy methods for backward compatibility
  async getAvailableFacts(): Promise<Record<string, FactTable[]>> {
    return this.finance.getAvailableFacts();
  }

  async getAvailableDimensions(fact?: string): Promise<string[]> {
    return this.finance.getAvailableDimensions(fact);
  }

  async getAnalytics(
    factName: string,
    options: AnalyticsOptions = {}
  ): Promise<AnalyticsResponse> {
    return this.finance.getAnalytics(factName, options);
  }

  async getTrends(
    factName: string,
    options: TrendsOptions = {}
  ): Promise<TrendsResponse> {
    return this.finance.getTrends(factName, options);
  }

  async getComparison(
    factName: string,
    options: ComparisonOptions = {}
  ): Promise<ComparisonResponse> {
    return this.finance.getComparison(factName, options);
  }

  // Legacy helper methods
  async getRevenueData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getRevenueData(timeGranularity);
  }

  async getExpenseData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getExpenseData(timeGranularity);
  }

  async getCustomerData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getAnalytics('revenue', {
      metrics: ['total_revenue'],
      dimensions: ['time', 'customer'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getOrderData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getAnalytics('revenue', {
      metrics: ['total_revenue'],
      dimensions: ['time', 'product'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getProductData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getAnalytics('revenue', {
      metrics: ['total_revenue'],
      dimensions: ['time', 'product'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getPaymentData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getAnalytics('cash_equivalent', {
      metrics: ['net_cash_movement'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getCogsData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getCogsData(timeGranularity);
  }

  async getCapexData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getAnalytics('capex', {
      metrics: ['capex_amount'],
      dimensions: ['time'],
      time_granularity: timeGranularity,
      use_mock_data: true,
    });
  }

  async getNetIncomeData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getNetIncomeData(timeGranularity);
  }

  async getArBalanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getArBalanceData(timeGranularity);
  }

  async getApBalanceData(
    timeGranularity:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly' = 'monthly'
  ) {
    return this.finance.getApBalanceData(timeGranularity);
  }
}

export const pottaAnalyticsService = new PottaAnalyticsService();
export default pottaAnalyticsService;
