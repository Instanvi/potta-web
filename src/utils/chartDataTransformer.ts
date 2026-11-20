import { AnalyticsResponse } from '../services/analyticsService';

export class ChartDataTransformer {
  /**
   * Transform time series data for line/bar charts
   */
  static transformTimeSeriesData(
    apiResponse: AnalyticsResponse,
    primaryMetric: string,
    secondaryMetric?: string
  ) {
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = apiResponse.data.map((item) => {
      // Handle different time formats
      if (item.month_name && item.year) {
        return this.formatMonthLabel(`${item.month_name} ${item.year}`);
      }
      if (item.period) {
        return item.period;
      }
      if (item.date) {
        return new Date(item.date).toLocaleDateString();
      }
      return item.time || 'Unknown';
    });

    const primaryData = apiResponse.data.map(
      (item) => Number(item[primaryMetric]) || 0
    );

    const datasets = [
      {
        label: this.formatMetricLabel(primaryMetric),
        data: primaryData,
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        tension: 0.1,
      },
    ];

    // Add secondary dataset if provided
    if (secondaryMetric) {
      const secondaryData = apiResponse.data.map(
        (item) => Number(item[secondaryMetric]) || 0
      );

      datasets.push({
        label: this.formatMetricLabel(secondaryMetric),
        data: secondaryData,
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        tension: 0.1,
      });
    }

    return {
      labels,
      datasets,
    };
  }

  /**
   * Transform data for pie/doughnut charts
   */
  static transformPieChartData(
    apiResponse: AnalyticsResponse,
    valueMetric: string,
    labelMetric: string
  ) {
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = apiResponse.data.map(
      (item) => item[labelMetric] || 'Unknown'
    );

    const data = apiResponse.data.map((item) => Number(item[valueMetric]) || 0);

    // Generate colors for each segment
    const colors = this.generateColors(data.length);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map((color) => color.replace('0.7', '1')),
          borderWidth: 2,
        },
      ],
    };
  }

  /**
   * Transform revenue data specifically
   */
  static transformRevenueData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'total_revenue');
  }

  /**
   * Transform expense data specifically
   */
  static transformExpenseData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'total_opex_amount');
  }

  /**
   * Transform customer data specifically
   */
  static transformCustomerData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'total_revenue');
  }

  /**
   * Transform order data specifically
   */
  static transformOrderData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'total_revenue');
  }

  /**
   * Transform product data specifically
   */
  static transformProductData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'total_revenue');
  }

  /**
   * Transform payment data specifically
   */
  static transformPaymentData(apiResponse: AnalyticsResponse) {
    return this.transformTimeSeriesData(apiResponse, 'net_cash_movement');
  }

  /**
   * Get default Chart.js options for different chart types
   */
  static getDefaultOptions(
    chartType:
      | 'line'
      | 'bar'
      | 'pie'
      | 'doughnut'
      | 'radar'
      | 'polarArea'
      | 'scatter'
      | 'bubble'
  ) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
    };

    switch (chartType) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Value',
              },
            },
          },
        };

      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Value',
              },
            },
          },
        };

      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce(
                    (a: number, b: number) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${this.formatValue(
                    value
                  )} (${percentage}%)`;
                },
              },
            },
          },
        };

      default:
        return baseOptions;
    }
  }

  /**
   * Calculate summary statistics from data
   */
  static calculateSummary(apiResponse: AnalyticsResponse, metric: string) {
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const values = apiResponse.data
      .map((item) => Number(item[metric]) || 0)
      .filter((value) => !isNaN(value));

    if (values.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      total,
      average,
      min,
      max,
      count: values.length,
    };
  }

  /**
   * Format currency values
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format number values
   */
  static formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  /**
   * Format any value based on context
   */
  static formatValue(
    value: number,
    type: 'currency' | 'percentage' | 'number' = 'number'
  ): string {
    switch (type) {
      case 'currency':
        return this.formatCurrency(value);
      case 'percentage':
        return this.formatPercentage(value);
      default:
        return this.formatNumber(value);
    }
  }

  /**
   * Generate colors for charts
   */
  private static generateColors(count: number): string[] {
    // Use green theme colors matching the old graphs pattern
    const colors = [
      '#22c55e', // Main green (like headcount)
      '#16a34a', // Darker green
      '#15803d', // Even darker green
      '#bbf7d0', // Light green
      '#4ade80', // Bright green
      '#86efac', // Medium light green
      '#a7f3d0', // Very light green
      '#6ee7b7', // Teal green
      '#34d399', // Emerald green
      '#10b981', // Dark emerald
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  /**
   * Format month labels to short form (e.g., "February 2025" -> "Feb")
   */
  private static formatMonthLabel(label: string): string {
    if (label.includes('January')) return 'Jan';
    if (label.includes('February')) return 'Feb';
    if (label.includes('March')) return 'Mar';
    if (label.includes('April')) return 'Apr';
    if (label.includes('May')) return 'May';
    if (label.includes('June')) return 'Jun';
    if (label.includes('July')) return 'Jul';
    if (label.includes('August')) return 'Aug';
    if (label.includes('September')) return 'Sep';
    if (label.includes('October')) return 'Oct';
    if (label.includes('November')) return 'Nov';
    if (label.includes('December')) return 'Dec';
    return label;
  }

  /**
   * Extract year from month label
   */
  private static extractYear(label: string): string | null {
    const yearMatch = label.match(/\b(20\d{2})\b/);
    return yearMatch ? yearMatch[1] : null;
  }

  /**
   * Format metric labels for display
   */
  private static formatMetricLabel(metric: string): string {
    const labelMap: Record<string, string> = {
      total_revenue: 'Total Revenue',
      total_expenses: 'Total Expenses',
      customer_count: 'Customer Count',
      order_count: 'Order Count',
      product_count: 'Product Count',
      payment_amount: 'Payment Amount',
      total_opex_amount: 'Operating Expenses',
      total_cost: 'Total Cost',
      net_cash_movement: 'Net Cash Movement',
      net_income_after_tax: 'Net Income After Tax',
      customer_running_balance: 'Customer Running Balance',
      vendor_running_balance: 'Vendor Running Balance',
    };

    return (
      labelMap[metric] ||
      metric.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  /**
   * Transform analytics data for charts
   */
  static transformAnalyticsData(
    data: any[],
    metric: string,
    dimensions: string[]
  ) {
    if (!data || !Array.isArray(data)) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Handle different dimension combinations
    if (dimensions.includes('time') && dimensions.length === 1) {
      // Time series data
      const labels = data.map((item) => {
        if (item.month_name && item.year) {
          return this.formatMonthLabel(`${item.month_name} ${item.year}`);
        }
        return item.time || 'Unknown';
      });

      const values = data.map((item) => Number(item[metric]) || 0);

      return {
        labels,
        datasets: [
          {
            label: this.formatMetricLabel(metric),
            data: values,
            borderColor: '#22c55e',
            backgroundColor: '#22c55e',
            tension: 0.1,
          },
        ],
      };
    } else if (dimensions.includes('time') && dimensions.includes('customer')) {
      // Customer dimension data - limit to top 5 customers for better presentation
      const customerTotals = data.reduce((acc, item) => {
        const customerName = item.first_name || item.customer_type || 'Unknown';
        acc[customerName] =
          (acc[customerName] || 0) + Number(item[metric] || 0);
        return acc;
      }, {} as Record<string, number>);

      // Get top 5 customers by total value (reduced from 10 to reduce clutter)
      const topCustomers = Object.entries(customerTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      const labels = [
        ...new Set(
          data.map((item) => {
            if (item.month_name && item.year) {
              return this.formatMonthLabel(`${item.month_name} ${item.year}`);
            }
            return item.time || 'Unknown';
          })
        ),
      ];

      // Extract year for title
      const year = this.extractYear(
        data[0]?.month_name && data[0]?.year
          ? `${data[0].month_name} ${data[0].year}`
          : ''
      );

      const datasets = topCustomers.map((customer, index) => {
        const customerData = labels.map((label) => {
          const matchingData = data.find((item) => {
            const itemLabel =
              item.month_name && item.year
                ? this.formatMonthLabel(`${item.month_name} ${item.year}`)
                : item.time || 'Unknown';
            return (
              itemLabel === label &&
              (item.first_name || item.customer_type) === customer
            );
          });
          return Number(matchingData?.[metric] || 0);
        });

        const colors = this.generateColors(topCustomers.length);
        return {
          label:
            customer.length > 15 ? customer.substring(0, 15) + '...' : customer,
          data: customerData,
          borderColor: colors[index],
          backgroundColor: colors[index],
          tension: 0.1,
        };
      });

      return {
        labels,
        datasets,
        year, // Add year for title display
      };
    } else if (dimensions.includes('time') && dimensions.includes('product')) {
      // Product dimension data - limit to top 5 products for better presentation
      const productTotals = data.reduce((acc, item) => {
        const productName = item.product_name || 'Unknown';
        acc[productName] = (acc[productName] || 0) + Number(item[metric] || 0);
        return acc;
      }, {} as Record<string, number>);

      // Get top 5 products by total value (reduced from 10 to reduce clutter)
      const topProducts = Object.entries(productTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      const labels = [
        ...new Set(
          data.map((item) => {
            if (item.month_name && item.year) {
              return this.formatMonthLabel(`${item.month_name} ${item.year}`);
            }
            return item.time || 'Unknown';
          })
        ),
      ];

      // Extract year for title
      const year = this.extractYear(
        data[0]?.month_name && data[0]?.year
          ? `${data[0].month_name} ${data[0].year}`
          : ''
      );

      const datasets = topProducts.map((product, index) => {
        const productData = labels.map((label) => {
          const matchingData = data.find((item) => {
            const itemLabel =
              item.month_name && item.year
                ? this.formatMonthLabel(`${item.month_name} ${item.year}`)
                : item.time || 'Unknown';
            return itemLabel === label && item.product_name === product;
          });
          return Number(matchingData?.[metric] || 0);
        });

        const colors = this.generateColors(topProducts.length);
        return {
          label:
            product.length > 15 ? product.substring(0, 15) + '...' : product,
          data: productData,
          borderColor: colors[index],
          backgroundColor: colors[index],
          tension: 0.1,
        };
      });

      return {
        labels,
        datasets,
        year, // Add year for title display
      };
    }

    // Default fallback
    const labels = data.map((item, index) => `Item ${index + 1}`);
    const values = data.map((item) => Number(item[metric]) || 0);

    return {
      labels,
      datasets: [
        {
          label: this.formatMetricLabel(metric),
          data: values,
          borderColor: '#22c55e',
          backgroundColor: '#22c55e',
          tension: 0.1,
        },
      ],
    };
  }
}
