import React from 'react';
import { Eye, Download } from 'lucide-react';
import { BillingInvoice } from '../types';
import { Pagination } from '../../../components/ui/Pagination';

interface BillingTableProps {
  invoices: BillingInvoice[];
  onViewInvoice: (invoice: BillingInvoice) => void;
  onDownloadInvoice: (invoice: BillingInvoice) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load invoices. Please try again.',
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  itemsPerPage,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'PARTIAL':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'PENDING':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
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

  const paginatedInvoices = invoices;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200">
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Invoice No
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Grand Total
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Paid Amount
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Pending Amount
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading Invoices...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-rose-500 font-medium">
                  {errorMessage}
                </td>
              </tr>
            ) : paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                  No invoices found.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 whitespace-nowrap font-bold text-slate-800 font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="font-bold text-slate-800">{inv.patientName}</div>
                    <div className="text-xs text-slate-400 font-bold font-mono">{inv.patientId}</div>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-slate-500 font-medium">
                    {getFormattedDate(inv.date)}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-700">{inv.doctorName}</div>
                    <div className="text-xs text-slate-400 font-medium">{inv.doctorSpecialization}</div>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-extrabold text-slate-800 font-mono text-sm">
                    ₹{inv.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-bold text-emerald-600 font-mono text-sm">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-semibold text-rose-500 font-mono text-sm">
                    ₹{inv.pendingAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide inline-block ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        title="View Details"
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownloadInvoice(inv)}
                        title="Download Invoice"
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          itemNameSingular="invoice"
          itemNamePlural="invoices"
        />
      )}
    </div>
  );
};
