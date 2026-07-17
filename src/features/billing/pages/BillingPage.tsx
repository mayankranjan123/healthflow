import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Info, ExternalLink, Search, Filter, Calendar, User, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';
import { mockBillingApi } from '../utils/mockBillingApi';
import { BillingStats } from '../components/BillingStats';
import { BillingFilters } from '../components/BillingFilters';
import { BillingTable } from '../components/BillingTable';
import { CreateInvoiceForm } from '../components/CreateInvoiceForm';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { BillingInvoice, BillingFilters as FiltersType } from '../types';
import { mockSettingsApi } from '../../settings/utils/mockSettingsApi';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';

export const BillingPage: React.FC = () => {
  // Responsive hook
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Views
  const [isCreating, setIsCreating] = useState(false);

  // Data states
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [stats, setStats] = useState({
    revenueToday: 0,
    pendingPayments: 0,
    paidInvoicesCount: 0,
    partialPaymentsCount: 0,
  });

  // Settings
  const [billingSettings, setBillingSettings] = useState<any>(null);

  // Filters state
  const [filters, setFilters] = useState<FiltersType>({
    patientOrInvoiceId: '',
    fromDate: '',
    toDate: '',
    status: 'ALL',
    doctorName: '',
  });

  // Temporary mobile filters state
  const [tempFilters, setTempFilters] = useState<FiltersType>({
    patientOrInvoiceId: '',
    fromDate: '',
    toDate: '',
    status: 'ALL',
    doctorName: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const itemsPerPage = 5;

  // Track window resizing for mobile rendering
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep temporary filters in sync with applied filters
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // Deriving unique doctor names dynamically from loaded invoices (no extra API calls needed)
  const doctorsList = useMemo(() => {
    return Array.from(new Set(invoices.map((i) => i.doctorName))).filter(Boolean);
  }, [invoices]);

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<BillingInvoice | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(false);

  // On mount, load default configurations
  useEffect(() => {
    mockBillingApi.getStats().then(setStats);
    mockSettingsApi.getSettings().then((settings) => {
      if (settings && settings.billing) {
        setBillingSettings(settings.billing);
      }
    });
  }, []);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.patientOrInvoiceId);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters.patientOrInvoiceId]);

  // Load paginated & filtered data dynamically
  const loadBillingData = () => {
    setIsLoadingInvoices(true);
    mockBillingApi.getInvoices({
      pageNo: currentPage - 1,
      pageSize: itemsPerPage,
      patientSearch: debouncedSearch,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      status: filters.status,
      doctorName: filters.doctorName
    })
      .then((res: any) => {
        setInvoices(res.items || []);
        setTotalElements(res.totalItems || 0);
        setTotalPages(res.totalPages || 1);
        setIsLoadingInvoices(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingInvoices(false);
      });
  };

  useEffect(() => {
    loadBillingData();
  }, [currentPage, debouncedSearch, filters.fromDate, filters.toDate, filters.status, filters.doctorName]);

  // Compute next Invoice Number sequentially (e.g. INV-1005)
  const nextInvoiceNumber = useMemo(() => {
    const prefix = billingSettings?.invoicePrefix || 'INV';
    const startingNumber = billingSettings?.startingInvoiceNumber || 1001;

    if (invoices.length === 0) return `${prefix}-${startingNumber}`;

    // Scan IDs for high values
    const maxNum = invoices.reduce((max, inv) => {
      const regex = new RegExp(`${prefix}-(\\d+)`);
      const match = inv.invoiceNumber.match(regex);
      if (match) {
        const val = parseInt(match[1]);
        return val > max ? val : max;
      }
      return max;
    }, startingNumber - 1);

    return `${prefix}-${maxNum + 1}`;
  }, [invoices, billingSettings]);

  // Handlers
  const handleApplyFilters = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      patientOrInvoiceId: '',
      fromDate: '',
      toDate: '',
      status: 'ALL',
      doctorName: '',
    });
    setCurrentPage(1);
  };

  const handleCreateInvoiceSave = (newInvoice: BillingInvoice) => {
    mockBillingApi.addInvoice(newInvoice).then(() => {
      loadBillingData();
      mockBillingApi.getStats().then(setStats);
    });
    setIsCreating(false);
  };

  const handleViewInvoiceDetails = (invoice: BillingInvoice) => {
    setAutoDownloadPdf(false);
    setPreviewInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const handleDownloadInvoiceSimulation = (invoice: BillingInvoice) => {
    setAutoDownloadPdf(true);
    setPreviewInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const handleCreateInvoicePreview = (invoice: BillingInvoice) => {
    setAutoDownloadPdf(false);
    setPreviewInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {!isCreating ? (
        <>
          {/* Mobile View */}
          {isMobile ? (
            <div className="space-y-5 pb-24">
              {/* Mobile Header */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Billing</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Manage clinic invoices, collect payments and pending dues</p>
              </div>

              {/* Stats Row */}
              <BillingStats stats={stats} />

              {/* Mobile Search & Filters Trigger Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patient or invoice ID..."
                    value={filters.patientOrInvoiceId}
                    onChange={(e) => handleApplyFilters({ ...filters, patientOrInvoiceId: e.target.value })}
                    className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium shadow-2xs"
                  />
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all bg-white shadow-2xs cursor-pointer ${(filters.fromDate || filters.toDate || filters.status !== 'ALL' || filters.doctorName)
                    ? 'border-brand-primary text-brand-primary bg-blue-50/30'
                    : 'border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Filter className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Mobile Active Filters Badge Pills */}
              {(filters.fromDate || filters.toDate || filters.status !== 'ALL' || filters.doctorName) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {filters.fromDate && (
                    <Badge variant="info" className="flex items-center gap-1">
                      <span>From: {filters.fromDate}</span>
                      <button onClick={() => handleApplyFilters({ ...filters, fromDate: '' })} className="hover:text-blue-900 font-bold ml-1 text-xs">×</button>
                    </Badge>
                  )}
                  {filters.toDate && (
                    <Badge variant="info" className="flex items-center gap-1">
                      <span>To: {filters.toDate}</span>
                      <button onClick={() => handleApplyFilters({ ...filters, toDate: '' })} className="hover:text-blue-900 font-bold ml-1 text-xs">×</button>
                    </Badge>
                  )}
                  {filters.status !== 'ALL' && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <span>Status: {filters.status}</span>
                      <button onClick={() => handleApplyFilters({ ...filters, status: 'ALL' })} className="hover:text-amber-900 font-bold ml-1 text-xs">×</button>
                    </Badge>
                  )}
                  {filters.doctorName && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <span>Dr. {filters.doctorName.split(' ').pop()}</span>
                      <button onClick={() => handleApplyFilters({ ...filters, doctorName: '' })} className="hover:text-emerald-900 font-bold ml-1 text-xs">×</button>
                    </Badge>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-slate-500 hover:text-brand-primary font-bold px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Invoices List Cards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-slate-800 text-base">Recent Invoices</h3>
                  <span className="text-xs text-slate-500 font-semibold">{totalElements} Total</span>
                </div>

                {isLoadingInvoices ? (
                  <div className="py-12 bg-white border border-slate-200 rounded-2xl flex flex-col justify-center items-center gap-3">
                    <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400 font-medium">Loading Invoices...</span>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="py-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-medium text-sm">
                    No invoices found.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => handleViewInvoiceDetails(inv)}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all active:scale-[0.995] cursor-pointer flex flex-col gap-3 relative overflow-hidden group"
                      >
                        {/* Top row: Number & Status badge */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">{inv.invoiceNumber}</span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                            inv.status === 'PARTIAL' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                              'bg-rose-50 text-rose-700 border-rose-150'
                            }`}>
                            {inv.status}
                          </span>
                        </div>

                        {/* Mid Row: Patient details */}
                        <div>
                          <h4 className="text-base font-bold text-slate-800 tracking-tight leading-snug">{inv.patientName}</h4>
                          <span className="text-[10px] text-slate-400 font-bold font-mono mt-0.5 inline-block bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{inv.patientId}</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100/80 my-0.5" />

                        {/* Bottom Row: Date & Doctor & Grand Total */}
                        <div className="flex justify-between items-end">
                          <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{getFormattedDate(inv.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">Dr. {inv.doctorName.split(' ').pop()}</span>
                            </div>
                          </div>

                          {/* Grand Total */}
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Grand Total</span>
                            <span className="text-lg font-black text-slate-900 font-mono">
                              ₹{inv.grandTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Partial Payment breakdown bar */}
                        {inv.status === 'PARTIAL' && (
                          <div className="space-y-1.5 pt-1.5 border-t border-dashed border-slate-100 mt-0.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-emerald-600">Paid: ₹{inv.paidAmount.toLocaleString('en-IN')}</span>
                              <span className="text-rose-500">Pending: ₹{inv.pendingAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${(inv.paidAmount / inv.grandTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Quick Actions bottom drawer bar */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/50 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoiceDetails(inv);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoiceSimulation(inv);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mobile Pagination Controls */}
                {totalElements > 0 && !isLoadingInvoices && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        className="p-2.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-3xs"
                      >
                        <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        className="p-2.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-3xs"
                      >
                        <ChevronRight className="w-4.5 h-4.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Banner Mobile optimized */}

            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Billing</h2>
                  <p className="text-sm text-slate-500 font-medium">Manage clinic invoices, collect payments and pending dues</p>
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="shadow-sm bg-brand-primary hover:bg-indigo-700 text-white font-bold text-sm px-5 h-11 transition-all rounded-lg flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4.5 h-4.5 shrink-0" />
                  <span>Create Invoice</span>
                </button>
              </div>

              {/* Stats Row */}
              <BillingStats stats={stats} />

              {/* Filters Bar */}
              <BillingFilters
                initialFilters={filters}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                doctors={doctorsList}
              />

              {/* Invoices List Table */}
              <BillingTable
                invoices={invoices}
                totalItems={totalElements}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                isLoading={isLoadingInvoices}
                onViewInvoice={handleViewInvoiceDetails}
                onDownloadInvoice={handleDownloadInvoiceSimulation}
              />

              {/* Compliance Bottom Banner */}
              {/* <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white shadow-sm">
                <div className="flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-lg bg-indigo-900 flex items-center justify-center text-indigo-400 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-100">Tax Compliance Reminder</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      GST reports for Q3 are now available in the Reports section. Ensure all partial payments are reconciled before the 10th of next month.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Redirecting to GST & Tax Compliance report overview...')}
                  className="text-xs font-bold text-indigo-300 hover:text-white transition-colors bg-indigo-900 hover:bg-indigo-850 px-4 py-2.5 rounded-lg border border-indigo-800 shrink-0 flex items-center gap-1.5 cursor-pointer self-stretch md:self-auto justify-center"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div> */}
            </>
          )}
        </>
      ) : (
        <CreateInvoiceForm
          nextInvoiceNumber={nextInvoiceNumber}
          onSave={handleCreateInvoiceSave}
          onCancel={() => setIsCreating(false)}
          onPreview={handleCreateInvoicePreview}
        />
      )}

      {/* Invoice Details Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setAutoDownloadPdf(false);
        }}
        invoice={previewInvoice}
        autoDownload={autoDownloadPdf}
        onPrint={() => {
          alert('Opening print window...');
          window.print();
        }}
      />

      {/* Mobile Filters Drawer */}
      {isMobile && (
        <Drawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          title="Filter Invoices"
        >
          <div className="flex flex-col h-full justify-between pb-8">
            <div className="space-y-6">
              {/* Date Range Group */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tempFilters.fromDate}
                      onChange={(e) => setTempFilters({ ...tempFilters, fromDate: e.target.value })}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tempFilters.toDate}
                      onChange={(e) => setTempFilters({ ...tempFilters, toDate: e.target.value })}
                      className="w-full pl-10 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</label>
                <select
                  value={tempFilters.status}
                  onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as any })}
                  className="w-full px-3.5 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Doctor */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</label>
                <select
                  value={tempFilters.doctorName}
                  onChange={(e) => setTempFilters({ ...tempFilters, doctorName: e.target.value })}
                  className="w-full px-3.5 h-11 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">All Doctors</option>
                  {doctorsList.map((name) => (
                    <option key={name} value={name}>
                      Dr. {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3.5 pt-6 border-t border-slate-200/60 mt-10">
              <button
                onClick={() => {
                  setTempFilters({
                    patientOrInvoiceId: filters.patientOrInvoiceId,
                    fromDate: '',
                    toDate: '',
                    status: 'ALL',
                    doctorName: '',
                  });
                  handleResetFilters();
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  handleApplyFilters(tempFilters);
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Floating Action Button (FAB) for Mobile */}
      {isMobile && !isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="fixed bottom-20 right-5 z-45 bg-brand-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-scale-in"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
