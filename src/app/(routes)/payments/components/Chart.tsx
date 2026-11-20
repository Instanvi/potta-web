import React, { FC } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Define your own type for series data
type ApexSeries = {
    name: string;
    data: number[];
};

interface ChartProps { }

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Chart: FC<ChartProps> = () => {
    const options: ApexOptions = {
        chart: {
            id: "apexchart-example",
            toolbar: { show: false },
            stacked: true,
        },
        xaxis: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ],
        },
        colors: ["#A0E86F"],
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            curve: "smooth",
            lineCap: "butt",
            colors: undefined,
            width: 1,
            dashArray: 0,
        },
    };

    const series: ApexSeries[] = [
        {
            name: "VTK",
            data: [100, 500, 400, 50, 870, 500, 600, 56, 780, 100, 340, 700],
        },
    ];

    return (
        <div className="border p-3">
            <ApexChart type="bar" options={options} series={series} height={500} />
        </div>
    );
};

export default Chart;