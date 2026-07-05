import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MonthlyRevenueItem } from '../types';

interface MonthlyRevenueTrendProps {
  data: MonthlyRevenueItem[];
}

export const MonthlyRevenueTrend: React.FC<MonthlyRevenueTrendProps> = ({ data }) => {
  // Format Indian currency representation
  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  // Find min and max
  const revenues = data.map(d => d.revenue);
  const minRevenue = revenues.length > 0 ? Math.min(...revenues) : 85000;
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 156000;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base">Monthly Revenue Trend</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Growth comparison (Jan - Jul 2026)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block shrink-0" />
          <span className="text-xs font-bold text-slate-500 font-sans">Revenue (₹)</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#94a3b8' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer labels */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold font-mono">
        <span className="text-slate-500">
          ₹{(minRevenue / 1000).toFixed(0)}k <span className="text-slate-400 font-sans font-medium">(Min)</span>
        </span>
        <span className="text-slate-500">
          ₹{(maxRevenue / 100000).toFixed(2)}L <span className="text-slate-400 font-sans font-medium">(Max)</span>
        </span>
      </div>
    </div>
  );
};
