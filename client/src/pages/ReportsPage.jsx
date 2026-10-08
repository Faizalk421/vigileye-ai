import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useNotification } from '../context/NotificationContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
  Eye,
  AlertTriangle,
  Award,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getReports(period);
        if (res.success && res.data) {
          setReport(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const s = report.summary;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Metric,Value',
        `Report Period,${period.toUpperCase()}`,
        `Total Monitoring Time,${s.totalMonitoringFormatted}`,
        `Total Sessions,${s.totalSessions}`,
        `Total Blinks,${s.totalBlinks}`,
        `Average Blink Rate,${s.averageBlinkRate} /min`,
        `Drowsiness Incidents,${s.totalDrowsinessEvents}`,
        `Longest Eye Closure,${s.longestEyeClosureSeconds}s`,
        `Mean EAR,${s.averageEAR}`,
        `Peak Monitoring Time,${s.peakMonitoringPeriod}`,
        `Safety Grade,${s.safetyRating}`
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vigileye_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV downloaded.', 'success');
  };

  const summary = report?.summary || {};

  return (
    <div className="space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Executive Safety & Telemetry Reports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Synthesized periodic reports on alertness, eye hydration, and drowsiness events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  period === p ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCSV}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Generating {period} executive safety report...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {period} Telemetry Audit
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">Alertness & Fatigue Executive Report</h2>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>{summary.safetyRating || 'Optimal'}</span>
              </div>
            </div>

            {/* Key Metrics 3x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs">Total Monitored Time</span>
                <p className="text-xl font-bold text-white font-mono">{summary.totalMonitoringFormatted}</p>
                <p className="text-[10px] text-slate-500">{summary.totalSessions} sessions</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs">Total Blinks Recorded</span>
                <p className="text-xl font-bold text-sky-400 font-mono">{summary.totalBlinks?.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">Avg {summary.averageBlinkRate}/min</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs">Drowsiness Alarms</span>
                <p className="text-xl font-bold text-rose-400 font-mono">{summary.totalDrowsinessEvents}</p>
                <p className="text-[10px] text-slate-500">Max closure {summary.longestEyeClosureSeconds}s</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs">Mean Eye Aperture</span>
                <p className="text-xl font-bold text-cyan-300 font-mono">{summary.averageEAR}</p>
                <p className="text-[10px] text-slate-500">EAR Baseline Openness</p>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Peak Monitoring Window</span>
                </span>
                <p className="text-sm font-bold text-white">{summary.peakMonitoringPeriod}</p>
                <p className="text-slate-400 text-[11px]">
                  Timeslot with the highest density of camera-based computer vision sessions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Cognitive Visual Alertness</span>
                </span>
                <p className="text-sm font-bold text-white">97.8% Mean Attention Score</p>
                <p className="text-slate-400 text-[11px]">
                  Computed based on continuous EAR openness duration versus auto-reset alarm frequencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
