import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Info, ExternalLink } from 'lucide-react';
import { mockBillingApi } from '../utils/mockBillingApi';
import { BillingStats } from '../components/BillingStats';
import { BillingFilters } from '../components/BillingFilters';
import { BillingTable } from '../components/BillingTable';
import { CreateInvoiceForm } from '../components/CreateInvoiceForm';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { BillingInvoice, BillingFilters as FiltersType } from '../types';

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

  // Filters state
  const [filters, setFilters] = useState<FiltersType>({
    patientOrInvoiceId: '',
    fromDate: '',
    toDate: '',
    status: 'ALL',
    doctorId: '',
  });

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<BillingInvoice | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // On mount, load data
  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = () => {
    mockBillingApi.getInvoices().then(setInvoices);
    mockBillingApi.getStats().then(setStats);
  };

  // Compute next Invoice Number sequentially (e.g. INV-1005)
  const nextInvoiceNumber = useMemo(() => {
    const defaultNext = 1005;
    if (invoices.length === 0) return `INV-${defaultNext}`;
    
    // Scan IDs for high values
    const maxNum = invoices.reduce((max, inv) => {
      const match = inv.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        const val = parseInt(match[1]);
        return val > max ? val : max;
      }
      return max;
    }, 1000);

    return `INV-${maxNum + 1}`;
  }, [invoices]);

  // Apply filters to invoices list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Patient or Invoice Search
      if (filters.patientOrInvoiceId.trim()) {
        const query = filters.patientOrInvoiceId.toLowerCase();
        const matchesPatientName = inv.patientName.toLowerCase().includes(query);
        const matchesPatientId = inv.patientId.toLowerCase().includes(query);
        const matchesPhone = inv.patientPhone.toLowerCase().includes(query);
        const matchesInvoiceNo = inv.invoiceNumber.toLowerCase().includes(query);
        if (!matchesPatientName && !matchesPatientId && !matchesPhone && !matchesInvoiceNo) {
          return false;
        }
      }

      // 2. From Date
      if (filters.fromDate) {
        if (inv.date < filters.fromDate) return false;
      }

      // 3. To Date
      if (filters.toDate) {
        if (inv.date > filters.toDate) return false;
      }

      // 4. Status
      if (filters.status !== 'ALL') {
        if (inv.status !== filters.status) return false;
      }

      // 5. Doctor
      if (filters.doctorId) {
        if (inv.doctorId !== filters.doctorId) return false;
      }

      return true;
    });
  }, [invoices, filters]);

  // Handlers
  const handleApplyFilters = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      patientOrInvoiceId: '',
      fromDate: '',
      toDate: '',
      status: 'ALL',
      doctorId: '',
    });
  };

  const handleCreateInvoiceSave = (newInvoice: BillingInvoice) => {
    mockBillingApi.addInvoice(newInvoice).then(() => {
      loadBillingData();
    });
    setIsCreating(false);
  };

  const handleViewInvoiceDetails = (invoice: BillingInvoice) => {
    setPreviewInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const handleDownloadInvoiceSimulation = (invoice: BillingInvoice) => {
    alert(`Downloading Invoice ${invoice.invoiceNumber} PDF... Clean billing statement saved to your downloads folder.`);
  };

  const handleCreateInvoicePreview = (invoice: BillingInvoice) => {
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
          />

          {/* Invoices List Table */}
          <BillingTable
            invoices={filteredInvoices}
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
        onClose={() => setIsPreviewModalOpen(false)}
        invoice={previewInvoice}
        onPrint={() => {
          alert('Opening print window...');
          window.print();
        }}
        onDownload={() => {
          if (previewInvoice) {
            handleDownloadInvoiceSimulation(previewInvoice);
          }
        }}
      />
    </div>
  );
};
