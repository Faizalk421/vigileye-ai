import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { useNotification } from '../context/NotificationContext';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Activity,
  Calendar
} from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [order, setOrder] = useState('desc');
  const { showToast } = useNotification();

  const fetchSessions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await sessionService.getSessions({
        page,
        limit: 10,
        search,
        status: statusFilter,
        sortBy,
        order
      });
      if (res.success && res.data) {
        setSessions(res.data.sessions || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load session history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(1);
  }, [search, statusFilter, sortBy, order]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session record?')) return;
    try {
      await sessionService.deleteSession(id);
      showToast('Session record deleted.', 'success');
      fetchSessions(pagination.page);
    } catch (err) {
      showToast('Failed to delete session', 'error');
    }
  };

  const exportCSV = () => {
    if (sessions.length === 0) {
      showToast('No session data to export.', 'error');
      return;
    }

    const headers = ['Session ID', 'Start Time', 'Duration (s)', 'Blinks', 'Blink Rate (/min)', 'Drowsiness Events', 'Longest Closure (s)', 'Average EAR'];
    const rows = sessions.map(s => [
      s.id,
      new Date(s.startTime).toISOString(),
      s.durationSeconds,
      s.blinkCount,
      s.averageBlinkRate,
      s.drowsinessCount,
      s.longestClosureSeconds,
      s.avgEAR
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vigileye_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully.', 'success');
  };

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            <span>Monitoring Session History</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review past eye closure telemetry logs, fatigue alerts, and EAR trends.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or device..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="startTime">Sort by Date</option>
            <option value="durationSeconds">Sort by Duration</option>
            <option value="drowsinessCount">Sort by Drowsiness Events</option>
            <option value="blinkCount">Sort by Blink Count</option>
          </select>
        </div>

        <div>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Blinks</th>
                <th className="py-3.5 px-4">Blink Rate</th>
                <th className="py-3.5 px-4">Drowsiness Events</th>
                <th className="py-3.5 px-4">Longest Closure</th>
                <th className="py-3.5 px-4">Average EAR</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading session records...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center space-y-3">
                    <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-slate-400 font-semibold">No monitoring sessions found.</p>
                    <Link
                      to="/monitor"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
                    >
                      <span>Start Your First Session</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">
                        {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {formatDuration(s.durationSeconds)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {s.blinkCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-400">{s.averageBlinkRate}</span>
                      <span className="text-[10px] text-slate-500"> /min</span>
                    </td>
                    <td className="py-3 px-4">
                      {s.drowsinessCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          {s.drowsinessCount} alert(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium">0 alerts</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {s.longestClosureSeconds}s
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                      {s.avgEAR}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/history/${s.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 inline-block transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total sessions)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSessions(pagination.page - 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSessions(pagination.page + 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
