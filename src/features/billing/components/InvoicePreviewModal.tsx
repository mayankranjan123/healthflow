import React from 'react';
import { X, Printer, Download, CheckSquare, Plus, Activity } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { BillingInvoice } from '../types';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPrint,
  onDownload,
}) => {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'PARTIAL':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'PENDING':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-150';
    }
  };

  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrintAction = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadAction = () => {
    if (onDownload) {
      onDownload();
    } else {
      alert('Generating PDF document... Saved to device downloads successfully!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-display font-bold text-slate-800 text-lg">Invoice Preview</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Printable/Paper Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8 text-slate-700 select-all shadow-inner print:bg-white print:border-none print:p-0">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 pb-6 border-b border-slate-200">
            {/* Logo & Clinic Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black tracking-wider shrink-0 shadow-sm shadow-indigo-200">
                  HF
                </div>
                <div>
                  <h4 className="font-display font-black text-slate-900 text-lg tracking-tight leading-tight">
                    HealthFlow
                  </h4>
                  <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase font-mono">
                    Specialty Clinic
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
                12th Floor, Med Tower, Tech Park,<br />
                Mumbai, Maharashtra - 400001<br />
                GSTIN: <span className="font-mono font-bold text-slate-500">27AAAAA0000A1Z5</span>
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="text-left sm:text-right space-y-1.5 sm:self-stretch flex flex-col justify-between items-start sm:items-end">
              <h3 className="font-display font-black text-slate-300 text-3xl tracking-widest leading-none">
                INVOICE
              </h3>
              <div className="text-xs font-semibold text-slate-500 space-y-0.5 font-sans">
                <div>
                  INVOICE NO:{' '}
                  <span className="font-mono font-bold text-slate-950">#{invoice.invoiceNumber}</span>
                </div>
                <div>
                  DATE:{' '}
                  <span className="font-mono font-bold text-slate-950">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 sm:justify-end">
                  STATUS:{' '}
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Physician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
            {/* Patient (Bill To) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block">
                Bill To:
              </span>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 text-base leading-snug">
                  {invoice.patientName}
                </h5>
                <span className="text-xs font-bold font-mono text-indigo-600 block">
                  {invoice.patientId}
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Phone: {invoice.patientPhone}<br />
                  {invoice.patientEmail && <>Email: {invoice.patientEmail}</>}
                </p>
              </div>
            </div>

            {/* Physician */}
            <div className="space-y-2 sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block">
                Treating Physician:
              </span>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 text-base leading-snug">
                  {invoice.doctorName}
                </h5>
                <span className="text-xs font-bold text-emerald-600 block">
                  {invoice.doctorSpecialization}
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Department: {invoice.doctorDepartment || 'Outpatient Services'}<br />
                  Registration: <span className="font-mono">REG-87421</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center w-12">Qty</th>
                  <th className="px-4 py-3 text-right w-24">Rate</th>
                  <th className="px-4 py-3 text-center w-20">Disc %</th>
                  <th className="px-4 py-3 text-center w-20">Tax %</th>
                  <th className="px-4 py-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-600">
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400 font-medium italic">
                      No medical itemized services listed.
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <span className="text-[10px] text-slate-400 font-medium font-sans">
                          Clinical health services
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold font-mono text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-medium">
                        ₹{item.rate.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-rose-500">
                        {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-500">
                        {item.taxPercent > 0 ? `${item.taxPercent}%` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold font-mono text-slate-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 pt-4">
            {/* Left Box (Payment Details details) */}
            <div className="bg-white border border-slate-150 rounded-xl p-4 text-xs font-medium text-slate-500 space-y-1.5 w-full sm:max-w-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block">
                Settlement Details
              </span>
              <div>
                Mode:{' '}
                <span className="font-bold text-slate-800 uppercase">
                  {invoice.paymentMode || 'CASH'}
                </span>
              </div>
              {invoice.referenceNo && (
                <div className="break-all">
                  Ref No:{' '}
                  <span className="font-mono font-bold text-slate-700">
                    {invoice.referenceNo}
                  </span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 italic pt-1 leading-normal border-t border-slate-100 mt-1">
                This is a computer-generated billing statement and does not require an ink signature.
              </div>
            </div>

            {/* Right Box (Sums) */}
            <div className="w-full sm:max-w-xs space-y-2.5 font-sans text-xs">
              <div className="flex justify-between font-medium text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500">
                <span>Discount</span>
                <span className="font-mono text-rose-500">- ₹{invoice.discountTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500 pb-2 border-b border-slate-200">
                <span>Tax</span>
                <span className="font-mono text-slate-800">₹{invoice.taxTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 py-1 border-b border-slate-200">
                <span>Grand Total</span>
                <span className="font-mono text-indigo-700 text-lg">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Paid Amount</span>
                  <span className="font-mono text-emerald-600">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Outstanding Balance</span>
                  <span className={`font-mono ${invoice.pendingAmount > 0 ? 'text-rose-500 font-extrabold' : 'text-slate-500'}`}>
                    ₹{invoice.pendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-150">
          <button
            onClick={onClose}
            className="px-5 h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-lg transition-colors cursor-pointer text-center"
          >
            Close
          </button>
          <button
            onClick={handlePrintAction}
            className="px-5 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handleDownloadAction}
            className="px-5 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Simple inline SVG or helper for design
const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);
