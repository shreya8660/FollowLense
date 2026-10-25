import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { GrowthDataPoint } from '../../types';

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

type TimeRange = '7D' | '14D' | '30D' | 'ALL';
type ChartMode = 'area' | 'velocity';

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [chartMode, setChartMode] = useState<ChartMode>('area');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === '7D') return data.slice(-7);
    if (timeRange === '14D') return data.slice(-14);
    if (timeRange === '30D') return data.slice(-30);
    return data;
  }, [data, timeRange]);

  const metrics = useMemo(() => {
    if (filteredData.length === 0) return { net: 0, peak: 0, lowest: 0 };
    const first = filteredData[0].followers;
    const last = filteredData[filteredData.length - 1].followers;
    const net = last - first;
    const peak = Math.max(...filteredData.map((d) => d.followers));
    const lowest = Math.min(...filteredData.map((d) => d.followers));
    return { net, peak, lowest };
  }, [filteredData]);

  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [0, 100];
    const minVal = Math.min(...filteredData.map((d) => d.followers));
    const maxVal = Math.max(...filteredData.map((d) => d.followers));
    const padding = Math.max(10, Math.round((maxVal - minVal) * 0.25));
    return [Math.max(0, minVal - padding), maxVal + padding];
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload as GrowthDataPoint;

    return (
      <div className="p-3 bg-[#16131D] border border-[#2B2038] rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>{label}</span>
        </p>
        <div className="space-y-1 font-mono tabular-nums">
          <div className="flex items-center justify-between gap-4 text-neutral-300">
            <span className="text-neutral-400">Total Followers:</span>
            <span className="font-semibold text-white">{item.followers.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-pink-400">
            <span>New Gained:</span>
            <span>+{item.gained}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-purple-400">
            <span>Unfollowed:</span>
            <span>-{item.lost}</span>
          </div>
          <div className="pt-1 mt-1 border-t border-[#261E33] flex items-center justify-between gap-4 text-neutral-200">
            <span>Net Change:</span>
            <span className={item.net >= 0 ? 'text-pink-400 font-semibold' : 'text-purple-300 font-semibold'}>
              {item.net >= 0 ? `+${item.net}` : item.net}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 rounded-xl bg-[#131117] border border-[#211C28]">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Follower Growth Trajectory
            </h3>
            <span className="text-xs text-purple-400/80 font-normal">· Historical snapshots</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400 font-mono tabular-nums">
            <span>
              Net: <strong className={metrics.net >= 0 ? 'text-pink-400 font-medium' : 'text-purple-400 font-medium'}>
                {metrics.net >= 0 ? `+${metrics.net}` : metrics.net}
              </strong>
            </span>
            <span>Peak: <strong className="text-purple-200 font-medium">{metrics.peak.toLocaleString()}</strong></span>
            <span>Lowest: <strong className="text-neutral-400 font-medium">{metrics.lowest.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Mode & Time Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 rounded-md bg-[#0D0B12] border border-[#201A28]">
            <button
              onClick={() => setChartMode('area')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                chartMode === 'area'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>Trend</span>
            </button>
            <button
              onClick={() => setChartMode('velocity')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                chartMode === 'velocity'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-white" />
              <span>Gained / Lost</span>
            </button>
          </div>

          <div className="flex items-center p-0.5 rounded-md bg-[#0D0B12] border border-[#201A28]">
            {(['7D', '14D', '30D', 'ALL'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D1726" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6B597C"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B597C"
                fontSize={11}
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => Math.round(val).toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#A855F7"
                strokeWidth={2}
                fill="#A855F7"
                fillOpacity={0.06}
                activeDot={{ r: 4, fill: '#A855F7', stroke: '#131117', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D1726" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6B597C"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B597C"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Separate colors: New Follows in Solid Pink, Unfollows in Solid Purple */}
              <Bar dataKey="gained" name="New Follows" fill="#EC4899" radius={[2, 2, 0, 0]} />
              <Bar dataKey="lost" name="Unfollows" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
