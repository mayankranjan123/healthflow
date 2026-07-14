import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Info, ExternalLink } from 'lucide-react';
import { mockBillingApi } from '../utils/mockBillingApi';
import { BillingStats } from '../components/BillingStats';
import { BillingFilters } from '../components/BillingFilters';
import { BillingTable } from '../components/BillingTable';
import { CreateInvoiceForm } from '../components/CreateInvoiceForm';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { BillingInvoice, BillingFilters as FiltersType } from '../types';
import { mockSettingsApi } from '../../settings/utils/mockSettingsApi';

export const BillingPage: React.FC = () => {
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const itemsPerPage = 5;

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

  return (
    <div className="space-y-6">
      {!isCreating ? (
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
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white shadow-sm">
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
          </div>
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
    </div>
  );
};
