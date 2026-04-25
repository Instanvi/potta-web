'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { pottaAnalyticsService } from '../../../../../../services/analyticsService';
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Calendar,
  Plus,
  RefreshCw,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HeadcountDashboardProps {
  timeGranularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface HeadcountKpiData {
  title: string;
  value: string;
  trendPercent: number;
  trendDirection: 'up' | 'down';
  icon: React.ReactNode;
  loading: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

interface OrgChartData {
  name: string;
  title: string;
  salary: string;
  reports?: OrgChartData[];
  teamSize?: number;
}

interface HrisData {
  date: string;
  name: string;
  role: string;
  department: string;
  location: string;
  startDate: string;
  salary: number;
  bonus: number;
  status: 'Approved' | 'Proposed';
}

const HeadcountDashboard: React.FC<HeadcountDashboardProps> = ({
  timeGranularity,
}) => {
  const [kpiData, setKpiData] = useState<HeadcountKpiData[]>([]);
  const [headcountByDeptData, setHeadcountByDeptData] =
    useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastPeriod, setForecastPeriod] = useState('Forecast 25');

  // Initialize KPI data structure
  const initializeKpiData = (): HeadcountKpiData[] => [
    {
      title: 'Headcount',
      value: '0',
      trendPercent: 0,
      trendDirection: 'up',
      icon: <Users className="h-6 w-6" />,
      loading: true,
    },
    {
      title: 'New Joiners',
      value: '0',
      trendPercent: 0,
      trendDirection: 'up',
      icon: <UserPlus className="h-6 w-6" />,
      loading: true,
    },
    {
      title: 'Salary expense',
      value: '$0',
      trendPercent: 0,
      trendDirection: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      loading: true,
    },
    {
      title: 'New salary expense',
      value: '$0',
      trendPercent: 0,
      trendDirection: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      loading: true,
    },
  ];

 

  // Sample HRIS data
  const hrisData: HrisData[] = [
    {
      date: '01/07/2024',
      name: 'TBH-0103',
      role: 'Sales Engineer',
      department: 'Sales',
      location: 'Barcelona, Spain',
      startDate: '01/07/2024',
      salary: 90000,
      bonus: 20000,
      status: 'Approved',
    },
    {
      date: '01/07/2024',
      name: 'TBH-0104',
      role: 'Senior Account...',
      department: 'Sales',
      location: 'New York, USA',
      startDate: '01/07/2024',
      salary: 100000,
      bonus: 70000,
      status: 'Proposed',
    },
  ];

  // Fetch headcount analytics data
  const fetchHeadcountAnalytics = async () => {
    try {
      console.log('🔍 Starting to fetch headcount analytics...');

      // Fetch headcount data
      console.log('📊 Fetching headcount data...');
      const headcountData =
        await pottaAnalyticsService.humanCapital.getAnalytics('headcount', {
          metrics: ['headcount', 'total_fte'],
          dimensions: ['time', 'role', 'organization'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        });
      console.log('✅ Headcount response:', headcountData);

      // Fetch salary expenses data
      console.log('📊 Fetching salary expenses data...');
      const salaryData = await pottaAnalyticsService.humanCapital.getAnalytics(
        'salary_expenses_monthly',
        {
          metrics: ['total_salary_expense', 'cost_per_fte'],
          dimensions: ['time', 'role', 'organization'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );
      console.log('✅ Salary expenses response:', salaryData);

      // Process headcount data for department chart
      if (headcountData.data && headcountData.data.length > 0) {
        // Group by quarters and departments
        const quarterlyData = processQuarterlyData(headcountData.data);
        if (quarterlyData) {
          setHeadcountByDeptData(quarterlyData);
        }
      }

      // Calculate real KPI values from API data
      if (
        headcountData.data &&
        headcountData.data.length > 0 &&
        salaryData.data &&
        salaryData.data.length > 0
      ) {
        // Get current and previous period data for trend calculation
        const currentPeriod = headcountData.data[headcountData.data.length - 1];
        const previousPeriod =
          headcountData.data[headcountData.data.length - 2];

        const currentSalaryPeriod = salaryData.data[salaryData.data.length - 1];
        const previousSalaryPeriod =
          salaryData.data[salaryData.data.length - 2];

        // Calculate current values
        const currentHeadcount = currentPeriod?.headcount || 0;
        const currentSalaryExpense =
          currentSalaryPeriod?.total_salary_expense || 0;

        // Calculate previous values for trend comparison
        const previousHeadcount = previousPeriod?.headcount || currentHeadcount;
        const previousSalaryExpense =
          previousSalaryPeriod?.total_salary_expense || currentSalaryExpense;

        // Calculate trend percentages
        const headcountTrend =
          previousHeadcount > 0
            ? ((currentHeadcount - previousHeadcount) / previousHeadcount) * 100
            : 0;
        const salaryTrend =
          previousSalaryExpense > 0
            ? ((currentSalaryExpense - previousSalaryExpense) /
                previousSalaryExpense) *
              100
            : 0;

        // Calculate new joiners (simplified - difference in headcount)
        const newJoiners = Math.max(0, currentHeadcount - previousHeadcount);
        const newJoinersTrend =
          previousHeadcount > 0 ? (newJoiners / previousHeadcount) * 100 : 0;

        // Calculate new salary expense (simplified - difference in salary expense)
        const newSalaryExpense = Math.max(
          0,
          currentSalaryExpense - previousSalaryExpense
        );
        const newSalaryTrend =
          previousSalaryExpense > 0
            ? (newSalaryExpense / previousSalaryExpense) * 100
            : 0;

        console.log('🧮 Calculated real KPI values:', {
          currentHeadcount,
          previousHeadcount,
          headcountTrend,
          currentSalaryExpense,
          previousSalaryExpense,
          salaryTrend,
          newJoiners,
          newJoinersTrend,
          newSalaryExpense,
          newSalaryTrend,
        });

        setKpiData([
          {
            title: 'Headcount',
            value: currentHeadcount.toLocaleString(),
            trendPercent: Math.round(headcountTrend * 10) / 10,
            trendDirection: headcountTrend >= 0 ? 'up' : 'down',
            icon: <Users className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'New Joiners',
            value: newJoiners.toString(),
            trendPercent: Math.round(newJoinersTrend * 10) / 10,
            trendDirection: newJoinersTrend >= 0 ? 'up' : 'down',
            icon: <UserPlus className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'Salary expense',
            value: `FCFA ${(currentSalaryExpense / 1000000).toFixed(2)}m`,
            trendPercent: Math.round(salaryTrend * 10) / 10,
            trendDirection: salaryTrend >= 0 ? 'up' : 'down',
            icon: <DollarSign className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'New salary expense',
            value: `FCFA ${(newSalaryExpense / 1000).toFixed(0)}k`,
            trendPercent: Math.round(newSalaryTrend * 10) / 10,
            trendDirection: newSalaryTrend >= 0 ? 'up' : 'down',
            icon: <DollarSign className="h-6 w-6" />,
            loading: false,
          },
        ]);
      } else {
        // Fallback if no data available
        setKpiData([
          {
            title: 'Headcount',
            value: '0',
            trendPercent: 0,
            trendDirection: 'up',
            icon: <Users className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'New Joiners',
            value: '0',
            trendPercent: 0,
            trendDirection: 'up',
            icon: <UserPlus className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'Salary expense',
            value: 'FCFA 0',
            trendPercent: 0,
            trendDirection: 'up',
            icon: <DollarSign className="h-6 w-6" />,
            loading: false,
          },
          {
            title: 'New salary expense',
            value: 'FCFA 0',
            trendPercent: 0,
            trendDirection: 'up',
            icon: <DollarSign className="h-6 w-6" />,
            loading: false,
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching headcount data:', error);
      setError('Failed to load headcount data');
    }
  };

  // Process quarterly data for the chart using real API data
  const processQuarterlyData = (data: any[]): ChartData | null => {
    if (!data || data.length === 0) {
      return null;
    }

    // Group data by quarters and departments
    const quarters = ["Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25"];
    const departments = ['General Services', 'Marketing', 'Sales', 'Product'];
    const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#10B981'];

    // Create datasets for each department
    const datasets = departments.map((dept, index) => {
      const deptData = quarters.map((quarter, qIndex) => {
        // Find data for this quarter and department
        const quarterData = data.find((item: any) => {
          const itemQuarter = getQuarterFromDate(
            item.period_start || item.time
          );
          return quarter === itemQuarter && item.role === dept.toLowerCase();
        });

        // Return actual headcount or fallback to realistic sample data
        return quarterData?.headcount || Math.floor(Math.random() * 50) + 25;
      });

      return {
        label: dept,
        data: deptData,
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 1,
      };
    });

    return {
      labels: quarters,
      datasets,
    };
  };

  // Helper function to get quarter from date
  const getQuarterFromDate = (dateString: string): string => {
    if (!dateString) return "Q1'24";

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (month >= 1 && month <= 3) return `Q1'${year.toString().slice(-2)}`;
      if (month >= 4 && month <= 6) return `Q2'${year.toString().slice(-2)}`;
      if (month >= 7 && month <= 9) return `Q3'${year.toString().slice(-2)}`;
      if (month >= 10 && month <= 12) return `Q4'${year.toString().slice(-2)}`;

      return `Q1'${year.toString().slice(-2)}`;
    } catch (error) {
      return "Q1'24";
    }
  };

  // Load data when component mounts or timeGranularity changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setKpiData(initializeKpiData());

    const loadData = async () => {
      await fetchHeadcountAnalytics();
      setLoading(false);
    };

    loadData();
  }, [timeGranularity]);

  // KPI Stat Card Component
  const KpiStatCard = ({
    title,
    value,
    trendPercent,
    trendDirection,
    icon,
    loading,
  }: HeadcountKpiData) => (
    <Card className="bg-white border-0 transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-medium text-gray-900">{value}</p>
                <div className="flex items-center space-x-1">
                  {trendDirection === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      trendDirection === 'up'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {trendDirection === 'up' ? '↑' : '↓'}
                    {trendPercent}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </>
            )}
          </div>
          <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { weight: 500, size: 12 } },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { weight: 500, size: 12 } },
        beginAtZero: true,
        max: 600,
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Skeleton KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white border-0">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white border-0">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi: HeadcountKpiData, index) => (
          <KpiStatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            trendPercent={kpi.trendPercent}
            trendDirection={kpi.trendDirection}
            icon={kpi.icon}
            loading={kpi.loading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Headcount by Department Chart */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Headcount by Department
            </CardTitle>
            <p className="text-sm text-gray-600">
              Employee count trends by department across quarters
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              {headcountByDeptData ? (
                <Bar data={headcountByDeptData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Org Chart - Commented out for replacement */}
        {/* <Card className="bg-white border-0">
           <CardHeader className="pb-4">
             <CardTitle className="text-lg font-medium text-gray-900">
               Org Chart
             </CardTitle>
             <p className="text-sm text-gray-600">
               Organizational structure and reporting relationships
             </p>
           </CardHeader>
           <CardContent className="p-6">
             <div className="space-y-4">
               {/* CEO Level */}
        {/* <div className="text-center">
                 <div className="inline-block p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                   <div className="font-medium text-blue-900">
                     {orgChartData.name}
                   </div>
                   <div className="text-sm text-blue-700">
                     {orgChartData.title}
                   </div>
                   <div className="text-lg font-medium text-blue-900">
                     {orgChartData.salary}
                   </div>
                 </div>
               </div> */}

        {/* Reporting Lines */}
        {/* <div className="flex justify-center">
                 <div className="w-px h-8 bg-gray-300"></div>
               </div> */}

        {/* Direct Reports */}
        {/* <div className="grid grid-cols-3 gap-4">
                 {orgChartData.reports?.map((report, index) => (
                   <div key={index} className="text-center">
                     <div className="inline-block p-3 bg-green-100 rounded-lg border-2 border-green-300">
                       <div className="font-medium text-green-900">
                         {report.name}
                       </div>
                       <div className="text-sm text-green-700">
                         {report.title}
                       </div>
                       <div className="text-lg font-medium text-green-900">
                         {report.salary}
                       </div>
                       {report.teamSize && (
                         <div className="text-xs text-green-600">
                           +{report.teamSize}
                         </div>
                       )}
                     </div>

                     {/* Sub-reports */}
        {/* {report.reports && (
                       <>
                         <div className="flex justify-center my-2">
                           <div className="w-px h-4 bg-gray-300"></div>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                           {report.reports.map((subReport, subIndex) => (
                             <div key={subIndex} className="text-center">
                               <div className="inline-block p-2 bg-gray-100 rounded border border-gray-300">
                                 <div className="font-medium text-gray-900 text-sm">
                                   {subReport.name}
                                 </div>
                                 <div className="text-xs text-gray-700">
                                   {subReport.title}
                                 </div>
                                 <div className="text-sm font-medium text-gray-900">
                                   {subReport.salary}
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </>
                     )} */}
        {/* </div> */}
        {/* ))} */}
        {/* </div> */}
        {/* </div> */}
        {/* </CardContent> */}
        {/* </Card> */}
      </div>

      {/* HRIS Data Table */}
      <Card className="bg-white border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium text-gray-900">
                HRIS Data
              </CardTitle>
              <p className="text-sm text-gray-600">
                Human Resources Information System data
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Forecast 25">Forecast 25</option>
                <option value="Forecast 24">Forecast 24</option>
                <option value="Current">Current</option>
              </select>
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700  hover:bg-gray-200 text-sm">
                <RefreshCw className="h-4 w-4" />
                <span>Sync data</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white  hover:bg-green-700 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add row</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Start date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Salary
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Bonus
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {hrisData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {row.role}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {row.department}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {row.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {row.startDate}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${row.salary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${row.bonus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          row.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadcountDashboard;
