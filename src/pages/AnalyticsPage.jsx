import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import BlinkRateChart from '../charts/BlinkRateChart';
import DrowsinessChart from '../charts/DrowsinessChart';
import EarTrendChart from '../charts/EarTrendChart';
import DurationChart from '../charts/DurationChart';
import {
  BarChart3,
  Calendar,
  Activity,
  Eye,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ranges = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' }
  ];

  useEffect(() => {
    const loadCharts = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getCharts(range);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCharts();
  }, [range]);

  return (
    <div className="space-y-8">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Biometric & Fatigue Analytics</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive visualization of your blink frequencies, drowsiness events, and EAR baseline.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto self-start md:self-auto">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                range === r.value
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Computing chart telemetry for {range}...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 Analytics Visualizations in 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Blink Rate Over Time */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Average Blink Rate (BPM)</span>
                  </h3>
                  <p className="text-xs text-slate-400">Calculated blinks per minute over selected timeframe</p>
                </div>
              </div>
              <BlinkRateChart data={data?.chartData || []} />
            </div>

            {/* Chart 2: Drowsiness Events */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Drowsiness & Alarm Incidents</span>
                  </h3>
                  <p className="text-xs text-slate-400">Total eye closure alarms triggered per day</p>
                </div>
              </div>
              <DrowsinessChart data={data?.chartData || []} />
            </div>

            {/* Chart 3: Monitoring Duration */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>Monitoring Duration (Minutes)</span>
                  </h3>
                  <p className="text-xs text-slate-400">Active monitoring time per date</p>
                </div>
              </div>
              <DurationChart data={data?.chartData || []} />
            </div>

            {/* Chart 4: Average EAR Trend */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" />
                    <span>Eye Aspect Ratio (EAR) Trend</span>
                  </h3>
                  <p className="text-xs text-slate-400">Baseline eye openness indicator</p>
                </div>
              </div>
              <EarTrendChart data={data?.chartData || []} />
            </div>
          </div>

          {/* Session Performance Comparison Table */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Recent Session Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Session Date</th>
                    <th className="p-3">Duration (min)</th>
                    <th className="p-3">Blink Count</th>
                    <th className="p-3">Blink Rate</th>
                    <th className="p-3">Alarms</th>
                    <th className="p-3">Mean EAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(data?.sessions || []).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-mono">{Math.round(s.durationSeconds / 60)}m</td>
                      <td className="p-3 font-mono">{s.blinkCount}</td>
                      <td className="p-3 font-semibold text-emerald-400">{s.averageBlinkRate} /min</td>
                      <td className="p-3">
                        <span className={s.drowsinessCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {s.drowsinessCount}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-cyan-300">{s.avgEAR}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
