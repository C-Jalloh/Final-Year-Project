import React, { memo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { ChartDataPoint, TimeSeriesDataPoint, MultiSeriesDataPoint } from '@/lib/types/dashboard';

interface BaseChartProps {
  data: any[];
  width?: number | string;
  height?: number | string;
  className?: string;
}

interface LineChartComponentProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

export const CustomLineChart: React.FC<LineChartComponentProps> = memo(({
  data,
  dataKey,
  xAxisKey = 'date',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value.toLocaleString(), 'Value']}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

interface AreaChartComponentProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

export const CustomAreaChart: React.FC<AreaChartComponentProps> = ({
  data,
  dataKey,
  xAxisKey = 'date',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value.toLocaleString(), 'Value']}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BarChartComponentProps extends BaseChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey?: string;
  color?: string;
}

export const CustomBarChart: React.FC<BarChartComponentProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={nameKey}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Count']} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PieChartComponentProps extends BaseChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
}

export const CustomPieChart: React.FC<PieChartComponentProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Value']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MultiLineChartProps extends BaseChartProps {
  data: MultiSeriesDataPoint[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  xAxisKey?: string;
}

export const CustomMultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  lines,
  xAxisKey = 'date',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Loading and Error Components
export const ChartLoading: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div
    className="w-full bg-gray-50 animate-pulse rounded-lg border p-4"
    style={{ height }}
  >
    <div className="space-y-4">
      {/* Chart Title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Chart Area */}
      <div className="flex-1 space-y-2">
        {/* Y-axis labels */}
        <div className="flex items-end space-x-2 h-full">
          <div className="flex flex-col justify-between h-48 text-xs text-muted-foreground pr-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>

          {/* Chart bars/lines simulation */}
          <div className="flex-1 flex items-end space-x-4 pb-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                <Skeleton
                  className="w-full rounded-t"
                  style={{ height: `${Math.random() * 120 + 40}px` }}
                />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ChartError: React.FC<{ error: string; height?: number }> = ({ error, height = 300 }) => (
  <div
    className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-red-600 text-center">
      <div className="font-semibold">Chart Error</div>
      <div className="text-sm">{error}</div>
    </div>
  </div>
);
