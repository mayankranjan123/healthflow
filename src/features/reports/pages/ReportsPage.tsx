import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Calendar, RefreshCcw, TrendingUp, HelpCircle, CheckCircle2, DollarSign, Users, AlertCircle, Clock, ArrowLeft, ChevronLeft } from 'lucide-react';
import { MonthlyRevenueTrend } from '../components/MonthlyRevenueTrend';
import { TopDoctorPerformers } from '../components/TopDoctorPerformers';
import { ReportsFilters, ReportsData } from '../types';
import { reportService } from '../../../lib/apiClient';

export const ReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportsFilters>({
    quickFilter: 'TODAY',
    fromDate: '',
    toDate: '',
  });

  const [activeFilters, setActiveFilters] = useState<ReportsFilters>({
    quickFilter: 'TODAY',
    fromDate: '',
    toDate: '',
  });

  const [data, setData] = useState<ReportsData>({
    totalRevenue: 0,
    revenueChangePercent: 0,
    appointmentsCount: 0,
    appointmentsChangePercent: 0,
    pendingPayments: 0,
    pendingChangePercent: 0,
    monthlyRevenueTrend: [],
    topDoctors: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const loadReports = async () => {
      try {
        const reportData = await reportService.getReportData(1000000000, activeFilters);
        if (!active) return;
        setData(reportData);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadReports();
    return () => {
      active = false;
    };
  }, [activeFilters]);

  // Quick preset filter select
  const handleQuickPreset = (preset: 'TODAY' | 'WEEKLY' | 'MONTHLY') => {
    const updated = {
      quickFilter: preset,
      fromDate: '',
      toDate: '',
    };
    setFilters(updated);
    setActiveFilters(updated);
  };

  // Custom filter submissions
  const handleApplyFilter = () => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    const reset = {
      quickFilter: 'TODAY' as const,
      fromDate: '',
      toDate: '',
    };
    setFilters(reset);
    setActiveFilters(reset);
  };

  const handleExportExcel = () => {
    let start: Date;
    let end: Date;

    if (activeFilters.fromDate && activeFilters.toDate) {
      start = new Date(activeFilters.fromDate);
      end = new Date(activeFilters.toDate);
    } else {
      const today = new Date();
      if (activeFilters.quickFilter === 'TODAY') {
        start = today;
        end = today;
      } else if (activeFilters.quickFilter === 'WEEKLY') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(today.setDate(diff));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      } else { // MONTHLY
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      alert("Export failed: Cannot export data for a range greater than 90 days.");
      return;
    }

    const headers = ["Doctor Name", "Specialization", "Appointments", "Revenue (INR)", "Pending Dues (INR)", "Completed Ratio"];
    const rows = data.topDoctors.map(doc => [
      doc.name,
      doc.specialization,
      doc.appointments.toString(),
      doc.revenue.toString(),
      doc.pending.toString(),
      `${doc.completedConsultations}/${doc.appointments}`
    ]);

    rows.push([
      "TOTAL CUMULATIVE",
      "",
      totals.appointments.toString(),
      totals.revenue.toString(),
      totals.pending.toString(),
      `${totals.completedConsultations} Total`
    ]);

    const content = [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `healthflow_report_summary_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compute summary values for the doctors report summary table
  const totals = useMemo(() => {
    return data.topDoctors.reduce((acc, doc) => {
      acc.appointments += doc.appointments;
      acc.revenue += doc.revenue;
      acc.pending += doc.pending;
      acc.completedConsultations += doc.completedConsultations;
      return acc;
    }, { appointments: 0, revenue: 0, pending: 0, completedConsultations: 0 });
  }, [data.topDoctors]);

  // Formatted date or range label
  const filterLabel = useMemo(() => {
    if (activeFilters.fromDate && activeFilters.toDate) {
      return `Custom Range: ${new Date(activeFilters.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${new Date(activeFilters.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    switch (activeFilters.quickFilter) {
      case 'TODAY':
        return `Today (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
      case 'WEEKLY':
        return 'This Week (Current Week Audit)';
      case 'MONTHLY':
        return 'This Month (Current Month Ledger)';
    }
  }, [activeFilters]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm h-18">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/more')}
              className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-[#094093] font-display ml-1">
              Reports
            </h2>
          </div>
          <div>
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer shadow-xs"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="space-y-5 pb-24 px-6 pt-4 animate-fade-in-up">
          {/* Mobile Header with Export button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Performance</span>
            <button
              onClick={handleExportExcel}
              className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export</span>
            </button>
          </div>

          {/* Quick presets pills (scrollable) */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {(['TODAY', 'WEEKLY', 'MONTHLY'] as const).map((preset) => {
              const isActive = activeFilters.quickFilter === preset && !activeFilters.fromDate;
              return (
                <button
                  key={preset}
                  onClick={() => handleQuickPreset(preset)}
                  className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-3xs cursor-pointer ${isActive
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {preset.charAt(0) + preset.slice(1).toLowerCase()}
                </button>
              );
            })}
            <button
              onClick={() => setFilters(prev => ({ ...prev, quickFilter: 'TODAY' }))}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-3xs cursor-pointer ${activeFilters.fromDate
                ? 'bg-indigo-600 text-white font-black'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Custom
            </button>
          </div>

          {/* Date inputs (2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value, quickFilter: 'TODAY' }))}
                className="w-full pl-9 pr-2 h-10 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all shadow-3xs"
              />
            </div>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value, quickFilter: 'TODAY' }))}
                className="w-full pl-9 pr-2 h-10 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all shadow-3xs"
              />
            </div>
          </div>

          {/* Custom Date Filters Apply Actions */}
          {(filters.fromDate || filters.toDate) && (
            <div className="flex gap-2 justify-end animate-fade-in">
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs cursor-pointer transition-all shadow-3xs"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilter}
                className="px-4.5 py-1.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-3xs hover:bg-blue-700"
              >
                Apply Filter
              </button>
            </div>
          )}

          {/* Showing reports for label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Showing reports for {filterLabel}</span>
          </div>

          {isLoading ? (
            <div className="py-20 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-center items-center gap-3 shadow-3xs">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400 font-semibold animate-pulse">Loading live reports...</span>
            </div>
          ) : (
            <>
              {/* Stacked metric cards */}
              <div className="space-y-4">

                {/* Total Revenue */}
                <div className="bg-white border border-slate-200/85 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs relative overflow-hidden">
                  <div className="flex items-center gap-4.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 text-xl font-bold border border-teal-100 shadow-inner">
                      💵
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        TOTAL REVENUE
                      </span>
                      <h4 className="text-2xl font-display font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">
                        ₹{data.totalRevenue.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold italic mt-1 leading-none">
                        vs. ₹{Math.round(data.totalRevenue / (1 + (data.revenueChangePercent || 0) / 100)).toLocaleString('en-IN')} previous period
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0 self-start mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{data.revenueChangePercent >= 0 ? `+${data.revenueChangePercent}` : data.revenueChangePercent}%</span>
                  </div>
                </div>

                {/* Appointments Count */}
                <div className="bg-white border border-slate-200/85 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs relative overflow-hidden">
                  <div className="flex items-center gap-4.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 text-xl font-bold border border-blue-100 shadow-inner">
                      📅
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        APPOINTMENTS
                      </span>
                      <h4 className="text-2xl font-display font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">
                        {data.appointmentsCount}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold italic mt-1 leading-none">
                        {data.appointmentsCount} consultations completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0 self-start mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{data.appointmentsChangePercent >= 0 ? `+${data.appointmentsChangePercent}` : data.appointmentsChangePercent}%</span>
                  </div>
                </div>

                {/* Pending Dues */}
                <div className="bg-white border border-slate-200/85 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs relative overflow-hidden">
                  <div className="flex items-center gap-4.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 text-xl font-bold border border-rose-100 shadow-inner">
                      ⏰
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        PENDING DUES
                      </span>
                      <h4 className="text-2xl font-display font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">
                        ₹{data.pendingPayments.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold italic mt-1 leading-none">
                        outstanding invoices
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 shrink-0 self-start mt-1">
                    <span>📉</span>
                    <span>{data.pendingChangePercent >= 0 ? `-${data.pendingChangePercent}%` : `${data.pendingChangePercent}%`}</span>
                  </div>
                </div>

              </div>

              {/* Revenue Trend chart */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-3xs overflow-hidden">
                <MonthlyRevenueTrend data={data.monthlyRevenueTrend} />
              </div>

              {/* Doctor performers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-slate-800 text-base">Doctor Performers</h3>
                  <button
                    onClick={() => alert('Opening detailed consultation audit logs...')}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>See All</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.topDoctors.slice(0, 3).map((doc) => {
                    const isGreen = doc.initials === 'SM';
                    const circleBg = isGreen ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-blue-50 text-blue-600 border-blue-100';

                    return (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className={`w-11 h-11 ${circleBg} border rounded-xl flex items-center justify-center shrink-0 text-xs font-black font-mono`}>
                            {doc.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                              {doc.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-slate-800 font-mono block">
                            ₹{doc.revenue.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-extrabold mt-0.5 inline-block">
                            {doc.completedConsultations} Consults
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </>
          )}
        </div>
      ) : (
        // Desktop Layout
        <>
          {/* Title Header with Export Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Reports</h2>
              <p className="text-sm text-slate-500 font-medium">Track clinic revenue, appointments and doctor performance</p>
            </div>
            <button
              onClick={handleExportExcel}
              className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 h-11 transition-all rounded-lg flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4.5 h-4.5 shrink-0" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Dynamic Date Filter Block */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">

              {/* Quick presets tab-toggle */}
              <div className="space-y-1.5 flex-1 max-w-sm">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quick Presets
                </span>
                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200 h-11">
                  {(['TODAY', 'WEEKLY', 'MONTHLY'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleQuickPreset(preset)}
                      className={`flex-1 text-center font-bold text-xs capitalize rounded-md transition-all cursor-pointer ${activeFilters.quickFilter === preset && !activeFilters.fromDate
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {preset.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* From Date input */}
              <div className="space-y-1.5 flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value, quickFilter: 'TODAY' }))}
                    className="w-full pl-3 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* To Date input */}
              <div className="space-y-1.5 flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value, quickFilter: 'TODAY' }))}
                    className="w-full pl-3 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Filter actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleResetFilters}
                  title="Reset Filters"
                  className="px-4.5 h-11 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  <span>Apply Filter</span>
                </button>
              </div>
            </div>

            {/* Selected indicators notification banner */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Showing reports for {filterLabel}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200/60 p-12 shadow-sm animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-500 font-medium animate-pulse">Loading live reports from API...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Revenue */}
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-5 shadow-sm flex items-center gap-4.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-xl font-bold shadow-inner">
                    💵
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      TOTAL REVENUE
                    </span>
                    <h4 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                      ₹{data.totalRevenue.toLocaleString('en-IN')}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>{data.revenueChangePercent >= 0 ? `+${data.revenueChangePercent}` : data.revenueChangePercent}% vs prev. period</span>
                    </div>
                  </div>
                </div>

                {/* Appointments count */}
                <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-5 shadow-sm flex items-center gap-4.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-xl font-bold shadow-inner">
                    📅
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      APPOINTMENTS
                    </span>
                    <h4 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                      {data.appointmentsCount.toLocaleString('en-IN')}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                      <span>📈</span>
                      <span>{data.appointmentsChangePercent >= 0 ? `+${data.appointmentsChangePercent}` : data.appointmentsChangePercent}% vs prev. period</span>
                    </div>
                  </div>
                </div>

                {/* Pending Dues */}
                <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-5 shadow-sm flex items-center gap-4.5">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 shrink-0 text-xl font-bold shadow-inner">
                    ⏰
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      PENDING DUES
                    </span>
                    <h4 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                      ₹{data.pendingPayments.toLocaleString('en-IN')}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <span>📉</span>
                      <span>{data.pendingChangePercent >= 0 ? `+${data.pendingChangePercent}% reduction` : `${Math.abs(data.pendingChangePercent)}% increase`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts section: Trend + Doctor contributions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MonthlyRevenueTrend data={data.monthlyRevenueTrend} />
                </div>
                <div>
                  <TopDoctorPerformers doctors={data.topDoctors} />
                </div>
              </div>

              {/* Report Summary Table (Cumulative doctor sheet) */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">Report Summary</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Itemized performance statistics per active physician</p>
                  </div>
                  <button
                    onClick={() => alert('Opening consultation audits database log...')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>View Detailed Log</span>
                    <span className="text-sm">↗</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4 text-center">Appointments</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                        <th className="px-6 py-4 text-right">Pending</th>
                        <th className="px-6 py-4 text-center">Completed Consultations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-sm font-semibold text-slate-700">
                      {data.topDoctors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 font-medium text-xs">
                            No physician activity found for this period.
                          </td>
                        </tr>
                      ) : (
                        data.topDoctors.map((doc) => {
                          const ratio = Math.round((doc.completedConsultations / (doc.appointments || 1)) * 100);

                          return (
                            <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors">
                              {/* Doctor ID & Initials */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-extrabold text-indigo-600 shrink-0">
                                    {doc.initials}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-sm">{doc.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono uppercase">
                                      {doc.specialization}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Appointments count */}
                              <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-slate-700">
                                {doc.appointments}
                              </td>

                              {/* Revenue sum */}
                              <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-slate-900 font-bold">
                                ₹{doc.revenue.toLocaleString('en-IN')}
                              </td>

                              {/* Pending sum */}
                              <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-rose-500">
                                ₹{doc.pending.toLocaleString('en-IN')}
                              </td>

                              {/* Completed ratio progress visualizer */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${ratio}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono font-bold text-slate-600 shrink-0">
                                    {doc.completedConsultations}/{doc.appointments}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}

                      {/* Cumulative totals row */}
                      <tr className="bg-slate-50/50 font-black text-slate-900 border-t border-slate-200 text-xs">
                        <td className="px-6 py-4 whitespace-nowrap font-mono uppercase tracking-wider font-bold">
                          TOTAL CUMULATIVE
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap font-mono">
                          {totals.appointments}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-indigo-700">
                          ₹{totals.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-rose-500">
                          ₹{totals.pending.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-emerald-600">
                          {totals.completedConsultations} Total
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
