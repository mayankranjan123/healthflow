import React from 'react';
import { X, Printer, Download, CheckSquare, Plus, Activity } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { BillingInvoice } from '../types';
import { mockSettingsApi } from '../../settings/utils/mockSettingsApi';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  onPrint?: () => void;
  onDownload?: () => void;
  autoDownload?: boolean;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPrint,
  onDownload,
  autoDownload = false,
}) => {
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      mockSettingsApi.getSettings().then(setSettings);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && autoDownload && invoice) {
      const timer = setTimeout(() => {
        handleDownloadAction();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDownload, invoice]);

  if (!invoice) return null;

  const clinic = settings?.clinic;
  const billing = settings?.billing;

  const showLogo = billing ? billing.showClinicLogo : true;
  const showAddress = billing ? billing.showClinicAddress : true;
  const showContact = billing ? billing.showClinicContact : true;
  const showDoctor = billing ? billing.showDoctorName : true;
  const showPayment = billing ? billing.showPaymentSummary : true;
  const showFooter = billing ? billing.showFooterMessage : true;
  const showSignature = billing ? billing.showAuthorizedSignature : true;
  const footerText = billing?.footerMessage || 'Thank you for visiting HealthFlow. Wish you a speedy recovery!';

  const clinicName = clinic?.name || 'HealthFlow';
  const clinicAddress = clinic?.addressLine
    ? `${clinic.addressLine}, ${clinic.city}, ${clinic.state} - ${clinic.pincode}`
    : '12th Floor, Med Tower, Tech Park, Mumbai, Maharashtra - 400001';
  const clinicPhone = clinic?.phone || '+91 99999 99999';
  const clinicEmail = clinic?.email || 'contact@healthflow.com';
  const clinicGst = clinic?.gstNumber || '';
  const taxLabel = billing?.taxLabel || 'GST';
  const templateId = invoice.templateId || billing?.selectedTemplateId || 'CLASSIC_MEDICAL';



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
    if (!invoice) return;
    const element = document.getElementById('invoice-printable-area');
    if (!element) return;

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '1130px';
    iframe.style.left = '-10000px';
    iframe.style.top = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const filename = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

    // Write content to iframe - loading both scripts inside the iframe context
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Invoice</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'brand-primary': '#005ae2',
                    'brand-secondary': '#0ea5e9',
                    slate: {
                      150: '#f1f5f9',
                      250: '#cbd5e1',
                      350: '#94a3b8',
                      450: '#64748b',
                      505: '#475569',
                      707: '#1e293b',
                      750: '#334155'
                    }
                  },
                  fontFamily: {
                    sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                    display: ["Space Grotesk", "sans-serif"],
                    mono: ["JetBrains Mono", "ui-monospace", "monospace"]
                  }
                }
              }
            }
          </script>
          <style>
            body { background: white; margin: 0; padding: 40px; font-family: "Inter", sans-serif; }
            #invoice-printable-area { border: none !important; box-shadow: none !important; }
          </style>
        </head>
        <body>
          <div id="invoice-printable-area">${element.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();

    const runDownload = () => {
      const iframeWindow = iframe.contentWindow as any;
      const iframeElement = doc.getElementById('invoice-printable-area');
      
      if (iframeWindow && iframeWindow.html2pdf && iframeElement) {
        const opt = {
          margin:       0.4,
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Output as blob to bypass iframe download sandbox security block in modern browsers
        iframeWindow.html2pdf().from(iframeElement).set(opt).output('blob').then((pdfBlob: Blob) => {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          
          // Cleanup resources
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(iframe);
        }).catch((err: any) => {
          console.error("PDF generation failed: ", err);
          document.body.removeChild(iframe);
        });
      } else {
        document.body.removeChild(iframe);
      }
    };

    // Check script load completion inside the iframe context
    const checkAndRun = () => {
      const iframeWindow = iframe.contentWindow as any;
      if (iframeWindow && iframeWindow.html2pdf && iframeWindow.tailwind) {
        runDownload();
      } else {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 100;
          if (iframeWindow && iframeWindow.html2pdf && iframeWindow.tailwind) {
            clearInterval(interval);
            runDownload();
          } else if (elapsed >= 3000) {
            clearInterval(interval);
            alert("Failed to render layout styles. Please print the invoice instead.");
            document.body.removeChild(iframe);
          }
        }, 100);
      }
    };

    // Give iframe a moment to initialize the scripts
    setTimeout(checkAndRun, 300);
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
        <div id="invoice-printable-area" className={`bg-white text-slate-707 select-all print:bg-white print:border-none print:p-0 ${templateId === 'MINIMAL_RECEIPT'
            ? 'p-6 sm:p-8 space-y-6 text-slate-800'
            : templateId === 'MODERN_COMPACT'
              ? 'p-4 sm:p-5 border border-indigo-200 bg-indigo-50/5 rounded-xl shadow-sm'
              : templateId === 'GST_DETAILED'
                ? 'p-6 sm:p-8 space-y-6 text-slate-800'
                : 'p-6 sm:p-8 space-y-8 border border-slate-200 rounded-xl shadow-sm'
          }`}>
          {/* Header Row */}
          <div className="flex flex-row justify-between items-start gap-4 pb-4">
            {/* Logo & Clinic Info */}
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5">
                {showLogo && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg className="w-4 h-4 fill-white text-white" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
                <h4 className="font-display font-black text-slate-900 text-lg tracking-tight leading-none pt-0.5">
                  {clinicName}
                </h4>
              </div>
              {showAddress && (
                <p className="text-[11px] text-slate-400 font-bold leading-tight max-w-xs">
                  {clinicAddress}
                  {clinicGst && <><br />GSTIN: <span className="font-mono font-bold text-slate-500">{clinicGst}</span></>}
                </p>
              )}
              {showContact && (
                <p className="text-[11px] text-slate-400 font-bold leading-tight mt-0.5">
                  {clinicPhone}
                </p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="text-right space-y-1">
              <h3 className="font-display font-black text-indigo-600 text-sm tracking-wider leading-none">
                INVOICE
              </h3>
              <div className="text-[15px] font-bold text-slate-750 font-sans tracking-tight">
                No: {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-400 font-bold">
                Date: {formattedDate}
              </div>
            </div>
          </div>

          {/* Bill To & Physician */}
          <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50/75 p-3 rounded-lg border border-slate-150/70">
            {/* Patient (Bill To) */}
            <div className="space-y-0.5 text-left leading-normal">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide block">
                Patient Details
              </span>
              <h5 className="font-bold text-slate-900 text-sm">
                {invoice.patientName}
              </h5>
              <p className="text-slate-500 font-semibold font-mono">
                {invoice.patientPhone}
              </p>
            </div>

            {/* Attending Doctor */}
            <div className="space-y-0.5 text-left pl-4 border-l border-slate-200/80 leading-normal">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide block">
                Attending Doctor
              </span>
              <h5 className="font-bold text-slate-900 text-sm">
                {invoice.doctorName}
              </h5>
              <span className="text-slate-500 font-semibold">
                {invoice.doctorSpecialization}
              </span>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-slate-350 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="px-1 py-2.5 text-left">Description</th>
                  <th className="px-1 py-2.5 text-center w-12">Qty</th>
                  <th className="px-1 py-2.5 text-right w-24">Price</th>
                  <th className="px-1 py-2.5 text-right w-20">GST</th>
                  <th className="px-1 py-2.5 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-1 py-6 text-center text-slate-400 font-medium italic">
                      No medical itemized services listed.
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item) => {
                    const rowSubtotal = item.quantity * item.rate;
                    const taxAmount = rowSubtotal * (item.taxPercent / 100);

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="border-b border-slate-100 font-bold text-slate-800 text-[11px]">
                          <td className="px-1 py-3 text-left">
                            {item.name}
                          </td>
                          <td className="px-1 py-3 text-center font-mono">
                            {item.quantity}
                          </td>
                          <td className="px-1 py-3 text-right font-mono text-slate-750">
                            ₹{item.rate.toLocaleString('en-IN')}.00
                          </td>
                          <td className="px-1 py-3 text-right font-mono text-slate-750">
                            ₹{taxAmount.toLocaleString('en-IN')}.00
                          </td>
                          <td className="px-1 py-3 text-right font-mono text-slate-900">
                            ₹{item.total.toLocaleString('en-IN')}.00
                          </td>
                        </tr>
                        {templateId === 'GST_DETAILED' && (
                          <tr className="bg-white">
                            <td colSpan={5} className="px-1 pb-3 pt-1">
                              <div className="bg-slate-50 p-2.5 rounded border border-slate-350 text-[9px] text-slate-500 font-mono space-y-0.5 leading-normal text-left">
                                <div className="flex justify-between">
                                  <span>HSN Code: 999311 (Medical OPD)</span>
                                  <span>CGST ({(item.taxPercent / 2).toFixed(0)}%): ₹{(taxAmount / 2).toLocaleString('en-IN')}.00</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Place of Supply: Punjab</span>
                                  <span>SGST ({(item.taxPercent / 2).toFixed(0)}%): ₹{(taxAmount / 2).toLocaleString('en-IN')}.00</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 pt-3 border-t border-slate-350">
            {/* Left Box (Payment Details details) */}
            {showPayment && (
              <div className="text-[11px] font-bold text-slate-505 text-left pt-2 leading-none">
                <span>Payment Mode: </span>
                <span className="text-slate-800 uppercase">
                  {invoice.paymentMode || 'CASH'} / UPI
                </span>
              </div>
            )}

            {/* Right Box (Sums) */}
            <div className="w-full sm:max-w-xs space-y-1.5 font-sans text-[11px] font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN')}.00</span>
              </div>

              {billing?.enableInvoiceLevelDiscount && (
                <div className="flex justify-between text-rose-500">
                  <span>Discount (10%):</span>
                  <span className="font-mono">-₹{invoice.discountTotal.toLocaleString('en-IN')}.00</span>
                </div>
              )}

              {templateId === 'GST_DETAILED' ? (
                <div className="flex justify-between pb-1.5">
                  <span>GST Tax ({invoice.items[0]?.taxPercent || 18}%):</span>
                  <span className="font-mono text-slate-900">₹{invoice.taxTotal.toLocaleString('en-IN')}.00</span>
                </div>
              ) : (
                <div className="flex justify-between pb-1.5">
                  <span>{taxLabel} Tax:</span>
                  <span className="font-mono text-slate-900">₹{invoice.taxTotal.toLocaleString('en-IN')}.00</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-indigo-750 pt-2 border-t-2 border-slate-350">
                <span className="flex flex-col text-left leading-none">
                  <span>Grand</span>
                  <span>Total:</span>
                </span>
                <span className="font-mono text-lg text-indigo-700 self-center">₹{invoice.grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>

          {/* Bottom section: Footer + Signature */}
          {(showFooter || showSignature) && (
            <div className="space-y-4 pt-4 border-t border-slate-100 text-slate-400 font-medium">

              {/* Footer message if checked */}
              {showFooter && footerText && (
                <p className="text-[10px] italic font-semibold text-slate-500 text-center leading-normal max-w-md mx-auto">
                  "{footerText}"
                </p>
              )}

              {/* Authorized signature if checked */}
              {showSignature && (
                <div className="flex flex-col items-end pt-2">
                  <div className="w-36 border-t border-slate-350 mt-4" />
                  <span className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mt-1 pr-4">
                    Authorized Signatory
                  </span>
                </div>
              )}
            </div>
          )}
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
