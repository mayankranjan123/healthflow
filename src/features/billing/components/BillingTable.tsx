import React, { useState } from 'react';
import { Eye, Download, AlertCircle } from 'lucide-react';
import { BillingInvoice } from '../types';
import { Pagination } from '../../../components/ui/Pagination';

interface BillingTableProps {
  invoices: BillingInvoice[];
  onViewInvoice: (invoice: BillingInvoice) => void;
  onDownloadInvoice: (invoice: BillingInvoice) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load invoices. Please try again.',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalItems = invoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Make sure page is inside range if items change
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

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
                Total
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Paid
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Pending
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-14 mx-auto" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-12 mx-auto" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500 font-medium text-sm">
                  <div className="flex flex-col items-center gap-2 justify-center text-rose-500">
                    <AlertCircle className="w-8 h-8 stroke-[2.25]" />
                    <span className="font-bold text-slate-800">Connection Error</span>
                    <span className="text-xs text-slate-400 font-medium">{errorMessage}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400 font-medium text-sm">
                  No invoices match your filters.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Invoice No */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span
                      onClick={() => onViewInvoice(inv)}
                      className="font-mono text-xs font-bold text-brand-primary cursor-pointer hover:underline"
                    >
                      {inv.invoiceNumber}
                    </span>
                  </td>

                  {/* Patient Name */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{inv.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold font-mono">
                        {inv.patientId}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-600">
                      {getFormattedDate(inv.date)}
                    </span>
                  </td>

                  {/* Doctor */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{inv.doctorName}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {inv.doctorSpecialization}
                      </span>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-semibold text-slate-900 font-mono text-sm">
                    ₹{inv.grandTotal.toLocaleString('en-IN')}
                  </td>

                  {/* Paid */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-semibold text-emerald-600 font-mono text-sm">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>

                  {/* Pending */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-right font-semibold text-rose-500 font-mono text-sm">
                    ₹{inv.pendingAmount.toLocaleString('en-IN')}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide inline-block ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>

                  {/* Actions */}
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
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          itemNameSingular="invoice"
          itemNamePlural="invoices"
        />
      )}
    </div>
  );
};
