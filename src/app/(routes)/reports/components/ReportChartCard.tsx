import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@potta/components/card';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from 'react-chartjs-2';

const chartMap = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  scatter: Scatter,
  bubble: Bubble,
};

type ReportChartCardProps = {
  title: string;
  description: string;
  chartType: keyof typeof chartMap;
  data: any;
  options: any;
  summary?: React.ReactNode;
  className?: string;
};

const ReportChartCard = ({
  title,
  description,
  chartType,
  data,
  options,
  summary,
  className = '',
}: ReportChartCardProps) => {
  const ChartComponent = chartMap[chartType];
  return (
    <div className={`min-h-[200px] min-w-[400px] ${className}`}>
      <Card className="h-full min-h-[200px] min-w-[400px] flex flex-col p-2 rounded-none border border-gray-200">
        <CardHeader className="flex flex-col items-start gap-1 mb-2">
          <CardTitle className="text-xl text-black">{title}</CardTitle>
          <CardDescription className="text-md mt-1 text-black">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="flex-1 w-full h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64 mb-2 flex items-center justify-center">
            {ChartComponent && <ChartComponent data={data} options={options} />}
          </div>
          {summary && (
            <div className="mt-3 text-xs flex items-center gap-1">
              {summary}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportChartCard;
