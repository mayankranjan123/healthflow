import React, { useState } from 'react';
import { FileSpreadsheet, Receipt, Percent, FileText, CheckCircle, Eye, Printer, ZoomIn, ShieldCheck } from 'lucide-react';
import { BillingSettings, InvoiceTemplateId } from '../types';

interface BillingSettingsTabProps {
  initialSettings: BillingSettings;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicGst?: string;
  onSave: (data: BillingSettings) => void;
}

export const BillingSettingsTab: React.FC<BillingSettingsTabProps> = ({
  initialSettings,
  clinicName,
  clinicAddress,
  clinicPhone,
  clinicGst,
  onSave
}) => {
  const [formData, setFormData] = useState<BillingSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<InvoiceTemplateId | null>(null);

  const handleToggle = (field: keyof BillingSettings) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleValChange = (field: keyof BillingSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // List of templates with descriptors
  const templates = [
    {
      id: 'CLASSIC_MEDICAL' as InvoiceTemplateId,
      name: 'Classic Medical',
      desc: 'Standard formal practice outline with corporate blue alignments.',
      color: 'border-slate-300 bg-slate-50',
      tag: 'Standard'
    },
    {
      id: 'MODERN_COMPACT' as InvoiceTemplateId,
      name: 'Modern Compact',
      desc: 'Tight borders, compact rows, with a solid brand-colored header banner.',
      color: 'border-indigo-400 bg-indigo-50/50',
      tag: 'Space Saving'
    },
    {
      id: 'GST_DETAILED' as InvoiceTemplateId,
      name: 'GST Detailed',
      desc: 'Dual grid structure showing itemized CGST, SGST, and HS Codes.',
      color: 'border-emerald-300 bg-emerald-50/50',
      tag: 'Legal Audit'
    },
    {
      id: 'MINIMAL_RECEIPT' as InvoiceTemplateId,
      name: 'Minimal Receipt Style',
      desc: 'Narrow print-optimized layout styled for 3-inch POS ticket printers.',
      color: 'border-amber-300 bg-amber-50/50',
      tag: 'POS Speed'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column (2/3 width) - Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Invoice Numbering */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Invoice Numbering</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Invoice Prefix */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleValChange('invoicePrefix', e.target.value)}
                  placeholder="e.g. INV"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="text-[10px] font-bold text-slate-400 block">
                  Preview: <span className="font-mono text-indigo-600">{formData.invoicePrefix}-{formData.startingInvoiceNumber}</span>
                </span>
              </div>

              {/* Starting Invoice Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Starting Number
                </label>
                <input
                  type="number"
                  value={formData.startingInvoiceNumber}
                  onChange={(e) => handleValChange('startingInvoiceNumber', parseInt(e.target.value) || 1)}
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Receipt Prefix */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Receipt Prefix
                </label>
                <input
                  type="text"
                  value={formData.receiptPrefix}
                  onChange={(e) => handleValChange('receiptPrefix', e.target.value)}
                  placeholder="e.g. RCP"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="text-[10px] font-bold text-slate-400 block">
                  Preview: <span className="font-mono text-indigo-600">{formData.receiptPrefix}-{formData.startingInvoiceNumber}</span>
                </span>
              </div>

              {/* Auto-generate switch */}
              <div className="flex items-center justify-between pt-4.5">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Auto-Generate Invoice No
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Sequentially increment starting number
                  </span>
                </div>
                
                {/* Beautiful custom toggle slider */}
                <button
                  type="button"
                  onClick={() => handleToggle('autoGenerateInvoiceNumber')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.autoGenerateInvoiceNumber ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.autoGenerateInvoiceNumber ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Tax and Discount Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Percent className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Tax & Discount Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Default Tax Percent */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Default Tax Percent (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.defaultTaxPercent}
                  onChange={(e) => handleValChange('defaultTaxPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Tax Label (GST, VAT) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tax Label / Name
                </label>
                <input
                  type="text"
                  value={formData.taxLabel}
                  onChange={(e) => handleValChange('taxLabel', e.target.value)}
                  placeholder="e.g. GST"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Set of switches */}
            <div className="border-t border-slate-100 pt-4.5 space-y-4">
              {/* Enable Item level tax */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enable Item-Level Tax
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Apply tax calculation to individual line items
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableItemLevelTax')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.enableItemLevelTax ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.enableItemLevelTax ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Enable invoice level discount */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enable Invoice-Level Discount
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Allow flat discount over subtotal on bottom ledger
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableInvoiceLevelDiscount')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.enableInvoiceLevelDiscount ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.enableInvoiceLevelDiscount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Enable item level discount */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enable Item-Level Discount
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Allow discount percentages inside the items list table
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableItemLevelDiscount')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.enableItemLevelDiscount ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.enableItemLevelDiscount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* GST number display toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Display GST Number on Layout
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Print the practice GST certificate code on invoices
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('gstNumberDisplay')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.gstNumberDisplay ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.gstNumberDisplay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Round off final amount */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Round-Off Final Amount
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Truncate decimals and round off invoices to nearest rupee
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('roundOffAmount')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.roundOffAmount ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.roundOffAmount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Invoice Template Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Invoice Template Selection</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => {
                const isSelected = formData.selectedTemplateId === tpl.id;
                
                return (
                  <div 
                    key={tpl.id}
                    onClick={() => handleValChange('selectedTemplateId', tpl.id)}
                    className={`border rounded-xl p-4.5 cursor-pointer transition-all flex flex-col justify-between h-44 relative overflow-hidden group select-none ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Visual miniature mockup blueprint lines */}
                    <div className="absolute right-3.5 top-3.5 opacity-25 flex flex-col gap-1 w-12 group-hover:scale-105 transition-transform">
                      <div className="h-1.5 w-8 bg-slate-400 rounded-full" />
                      <div className="h-1 w-11 bg-slate-300 rounded-full" />
                      <div className="h-1 w-6 bg-slate-300 rounded-full" />
                      <div className="h-6 w-12 border border-slate-400 rounded mt-1 border-dashed" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="invoiceTemplate"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0"
                        />
                        <span className="font-bold text-slate-800 text-sm leading-none">{tpl.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1.5 max-w-[170px]">
                        {tpl.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                        {tpl.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplateId(tpl.id);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Invoice Content Options */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Invoice Content Options</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
              {/* Checkboxes */}
              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showClinicLogo}
                  onChange={() => handleToggle('showClinicLogo')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show clinic logo</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showClinicAddress}
                  onChange={() => handleToggle('showClinicAddress')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show clinic address</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showClinicContact}
                  onChange={() => handleToggle('showClinicContact')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show clinic phone/email</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showGstOnHeader}
                  onChange={() => handleToggle('showGstOnHeader')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show GST number</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDoctorName}
                  onChange={() => handleToggle('showDoctorName')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show doctor name</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showPatientMobile}
                  onChange={() => handleToggle('showPatientMobile')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show patient mobile number</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showPaymentSummary}
                  onChange={() => handleToggle('showPaymentSummary')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show payment summary</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showPendingAmount}
                  onChange={() => handleToggle('showPendingAmount')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show pending amount</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showFooterMessage}
                  onChange={() => handleToggle('showFooterMessage')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show footer message</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showAuthorizedSignature}
                  onChange={() => handleToggle('showAuthorizedSignature')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show authorized signature area</span>
              </label>
            </div>

            {/* Footer message textarea */}
            <div className="space-y-1.5 pt-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Footer Message text</span>
                <span className="font-mono text-[11px]">
                  {formData.footerMessage.length} / 150
                </span>
              </div>
              <textarea
                maxLength={150}
                value={formData.footerMessage}
                onChange={(e) => handleValChange('footerMessage', e.target.value)}
                placeholder="e.g. Thank you for visiting HealthFlow. Wish you a speedy recovery!"
                className="w-full p-3.5 h-20 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 5: Print Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Printer className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Print Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Paper Size */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Default Paper Size
                </label>
                <select
                  value={formData.paperSize}
                  onChange={(e) => handleValChange('paperSize', e.target.value)}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="A4">A4 Standard Sheet</option>
                  <option value="A5">A5 Compact Leaflet</option>
                </select>
              </div>

              {/* Print Orientation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Print Orientation
                </label>
                <select
                  value={formData.printOrientation}
                  onChange={(e) => handleValChange('printOrientation', e.target.value)}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="PORTRAIT">Portrait (Vertical)</option>
                  <option value="LANDSCAPE">Landscape (Horizontal)</option>
                </select>
              </div>

              {/* PDF Footer */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  PDF Footer Message
                </label>
                <input
                  type="text"
                  value={formData.pdfFooterText}
                  onChange={(e) => handleValChange('pdfFooterText', e.target.value)}
                  placeholder="e.g. HealthFlow - Electronic Invoice Document"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* File name format */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Download File Name Format
                </label>
                <input
                  type="text"
                  value={formData.downloadFileNameFormat}
                  onChange={(e) => handleValChange('downloadFileNameFormat', e.target.value)}
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Auto download after save */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Auto-Download After Save
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Instantly save PDF copy on local device
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('autoDownloadAfterSave')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.autoDownloadAfterSave ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.autoDownloadAfterSave ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show print button after generation */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Show Print Button After Save
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Provide manual triggers for local printer setups
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('showPrintButtonAfterGen')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.showPrintButtonAfterGen ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.showPrintButtonAfterGen ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Form Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && (
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-4 h-4" />
                <span>Billing settings successfully saved!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Save Billing Preferences</span>
            </button>
          </div>

        </form>
      </div>

      {/* Right Column (1/3 width) - Live Invoice Preview */}
      <div className="space-y-6">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Live Layout Preview
            </h4>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => alert(`Simulating invoice print preview format: ${formData.paperSize} (${formData.printOrientation})`)}
                title="Print Preview"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setPreviewTemplateId(formData.selectedTemplateId)}
                title="Zoom Layout"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled-down Physical Invoice Container */}
          <div className={`bg-white border rounded-xl shadow-md p-4 min-h-[460px] flex flex-col justify-between text-[10px] text-slate-600 select-none ${
            formData.selectedTemplateId === 'CLASSIC_MEDICAL' ? 'border-slate-200' :
            formData.selectedTemplateId === 'MODERN_COMPACT' ? 'border-indigo-200' :
            formData.selectedTemplateId === 'GST_DETAILED' ? 'border-emerald-200' : 'border-slate-300'
          }`}>
            
            {/* Template Specific Header Bar */}
            <div className="space-y-3.5">
              {formData.selectedTemplateId === 'MODERN_COMPACT' && (
                <div className="bg-indigo-600 -mx-4 -mt-4 p-3 rounded-t-xl text-white flex items-center justify-between">
                  <span className="font-extrabold text-[11px] font-sans tracking-wide">
                    {formData.showClinicLogo ? `✦ ${clinicName}` : clinicName}
                  </span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                    {formData.invoicePrefix}-{formData.startingInvoiceNumber}
                  </span>
                </div>
              )}

              {/* Core Content Grid */}
              <div className="space-y-3">
                {formData.selectedTemplateId !== 'MODERN_COMPACT' && (
                  <div className="flex justify-between items-start">
                    <div>
                      {formData.showClinicLogo && (
                        <div className="w-5 h-5 rounded bg-slate-100 border border-slate-250 flex items-center justify-center text-[8px] font-extrabold text-indigo-600 mb-1">
                          ✦
                        </div>
                      )}
                      <h5 className="font-extrabold text-slate-900 text-[11px] leading-tight">
                        {clinicName}
                      </h5>
                      {formData.showClinicAddress && (
                        <p className="text-[8px] text-slate-400 mt-0.5 leading-normal max-w-[120px]">
                          {clinicAddress}
                        </p>
                      )}
                      {formData.showClinicContact && (
                        <p className="text-[8px] text-slate-400 mt-0.5 leading-none">
                          {clinicPhone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-extrabold text-indigo-700 block">
                        INVOICE
                      </span>
                      <span className="font-mono font-bold text-slate-600 block mt-0.5">
                        No: {formData.invoicePrefix}-{formData.startingInvoiceNumber}
                      </span>
                      <span className="block text-[8px] text-slate-400 font-mono mt-0.5">
                        Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Patient/Doctor Block */}
                <div className="bg-slate-50/75 rounded border border-slate-100 p-2 grid grid-cols-2 gap-2 text-[8px] leading-relaxed">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block font-bold text-[7px]">Patient Details</span>
                    <span className="font-bold text-slate-800 block">Rohan Mehra</span>
                    {formData.showPatientMobile && (
                      <span className="text-slate-500 font-mono block">+91 99000 88776</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block font-bold text-[7px]">Attending Doctor</span>
                    {formData.showDoctorName ? (
                      <span className="font-bold text-slate-800 block">Dr. Aisha Mehta</span>
                    ) : (
                      <span className="text-slate-400 block font-medium">Not Printed</span>
                    )}
                    <span className="text-slate-400 block">Cardiology</span>
                  </div>
                </div>

                {/* Items Table Mockup */}
                <div className="space-y-1 pt-1">
                  <div className="border-b border-slate-150 pb-1 flex items-center font-bold text-slate-400 uppercase tracking-wider text-[7px]">
                    <span className="flex-1">Consultation Service</span>
                    <span className="w-10 text-center">Qty</span>
                    <span className="w-12 text-right">Price</span>
                    {formData.enableItemLevelTax && (
                      <span className="w-10 text-right">{formData.taxLabel}</span>
                    )}
                    <span className="w-12 text-right">Total</span>
                  </div>

                  {/* Service Row */}
                  <div className="flex items-center py-1 font-bold text-slate-700 text-[8px]">
                    <span className="flex-1 text-slate-900 font-bold truncate">General Outpatient Service</span>
                    <span className="w-10 text-center font-mono">1</span>
                    <span className="w-12 text-right font-mono">₹1,500.00</span>
                    {formData.enableItemLevelTax && (
                      <span className="w-10 text-right font-mono">₹270.00</span>
                    )}
                    <span className="w-12 text-right font-mono">₹1,770.00</span>
                  </div>

                  {/* GST Detailed Extra Rows mock */}
                  {formData.selectedTemplateId === 'GST_DETAILED' && (
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-150 text-[7px] text-slate-400 font-mono space-y-0.5 leading-none">
                      <div className="flex justify-between">
                        <span>HSN Code: 999311 (Medical OPD)</span>
                        <span>CGST (9%): ₹135.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Place of Supply: Punjab</span>
                        <span>SGST (9%): ₹135.00</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* General Ledger Subtotals */}
                <div className="border-t border-slate-150 pt-2 flex flex-col items-end space-y-1 font-bold text-[8px] text-slate-600">
                  <div className="flex justify-between w-28">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-800">₹1,500.00</span>
                  </div>
                  {formData.enableInvoiceLevelDiscount && (
                    <div className="flex justify-between w-28 text-rose-500">
                      <span>Discount (10%):</span>
                      <span className="font-mono">-₹150.00</span>
                    </div>
                  )}
                  <div className="flex justify-between w-28">
                    <span>{formData.taxLabel} Tax ({formData.defaultTaxPercent}%):</span>
                    <span className="font-mono text-slate-800">₹270.00</span>
                  </div>
                  <div className="flex justify-between w-28 pt-1 border-t border-slate-150 text-[10px] text-indigo-700 font-extrabold">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{formData.roundOffAmount ? '1,620' : '1,620.00'}</span>
                  </div>
                </div>

                {/* Payment Summary section if checked */}
                {formData.showPaymentSummary && (
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[7.5px] font-bold">
                    <div className="text-slate-400">
                      <span>Payment Mode:</span>
                      <span className="text-slate-600 ml-1">ONLINE / UPI</span>
                    </div>
                    {formData.showPendingAmount && (
                      <div className="text-rose-500 font-mono font-extrabold bg-rose-50 px-1 py-0.5 rounded">
                        Pending: ₹0.00 (Fully Settled)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom section: Footer + Signature */}
            <div className="space-y-3.5 border-t border-slate-100 pt-2 text-center text-slate-400 font-medium">
              
              {/* Footer message if checked */}
              {formData.showFooterMessage && formData.footerMessage && (
                <p className="text-[7.5px] italic font-semibold text-slate-500 max-w-[190px] mx-auto leading-normal">
                  "{formData.footerMessage}"
                </p>
              )}

              {/* Show practice GST display code if checked */}
              {formData.gstNumberDisplay && clinicGst && (
                <div className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  CLINIC REG: {clinicGst}
                </div>
              )}

              {/* Authorized signature if checked */}
              {formData.showAuthorizedSignature && (
                <div className="flex flex-col items-end pt-1">
                  <div className="w-16 border-t border-slate-350 mt-4" />
                  <span className="text-[7px] uppercase font-bold text-slate-400 tracking-wider block mt-1 pr-1">
                    Authorized Signatory
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Template Preview Modal */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-zoom-in">
            <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-slate-900 text-base">
                Template Preview: {templates.find(t => t.id === previewTemplateId)?.name}
              </h3>
              <button 
                onClick={() => setPreviewTemplateId(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {/* Fully stylized actual document structure to impress the user */}
              <div className="border border-slate-300 rounded-xl p-6 space-y-6 text-xs text-slate-700 bg-white shadow-sm font-sans">
                
                {/* Simulated Header block */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-black text-indigo-600 block leading-none">✦</span>
                    <h2 className="text-base font-extrabold text-slate-900 leading-normal mt-1">{clinicName}</h2>
                    <p className="text-[11px] text-slate-400 font-semibold leading-normal mt-0.5 max-w-xs">{clinicAddress}</p>
                    <p className="text-[11px] text-slate-400 font-semibold leading-none mt-1">{clinicPhone}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-bold tracking-wider text-slate-900 font-mono">INVOICE</h1>
                    <p className="font-mono font-bold text-indigo-600 mt-1">No: {formData.invoicePrefix}-1024</p>
                    <p className="text-slate-400 font-bold font-mono mt-0.5">Date: October 24, 2023</p>
                  </div>
                </div>

                {/* Patient / Consultation info */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200 py-4 font-semibold">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-bold">Billed To</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">Mr. Rohan Mehra</p>
                    <p className="text-slate-500 font-mono text-xs mt-0.5">+91 99000 88776</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-bold">Clinical Care</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">Dr. Aisha Mehta</p>
                    <p className="text-slate-500 text-xs mt-0.5">Cardiology Department</p>
                  </div>
                </div>

                {/* Consultation Items Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="px-4 py-3">Service Item Name</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      {formData.enableItemLevelTax && (
                        <th className="px-4 py-3 text-right">{formData.taxLabel} Tax</th>
                      )}
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-bold text-slate-700">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <span className="block text-slate-800 font-bold">Comprehensive Electrocardiogram (ECG)</span>
                        <span className="text-[10px] text-slate-400 font-semibold">High precision cardiac muscle performance evaluation</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">1</td>
                      <td className="px-4 py-3.5 text-right font-mono">₹1,200.00</td>
                      {formData.enableItemLevelTax && (
                        <td className="px-4 py-3.5 text-right font-mono">18% (₹216)</td>
                      )}
                      <td className="px-4 py-3.5 text-right font-mono">₹1,416.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <span className="block text-slate-800 font-bold">Outpatient Consultation Session</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Primary clinical assessment and diagnostic consult</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">1</td>
                      <td className="px-4 py-3.5 text-right font-mono">₹500.00</td>
                      {formData.enableItemLevelTax && (
                        <td className="px-4 py-3.5 text-right font-mono">18% (₹90)</td>
                      )}
                      <td className="px-4 py-3.5 text-right font-mono">₹590.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Subtotals & Grand totals summary block */}
                <div className="flex flex-col items-end space-y-1.5 font-bold border-t border-slate-200 pt-4 text-xs">
                  <div className="flex justify-between w-64">
                    <span className="text-slate-400">Services Subtotal:</span>
                    <span className="font-mono">₹1,700.00</span>
                  </div>
                  {formData.enableInvoiceLevelDiscount && (
                    <div className="flex justify-between w-64 text-rose-500">
                      <span>Promo Discount (10%):</span>
                      <span className="font-mono">-₹170.00</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64">
                    <span className="text-slate-400">{formData.taxLabel} Combined ({formData.defaultTaxPercent}%):</span>
                    <span className="font-mono">₹306.00</span>
                  </div>
                  <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-black text-indigo-700">
                    <span>Grand Cumulative Total:</span>
                    <span className="font-mono">₹1,836.00</span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-4 border-t border-slate-150 text-center space-y-2">
                  <p className="text-[11px] italic font-semibold text-slate-500 leading-normal">
                    "{formData.footerMessage}"
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    {formData.pdfFooterText}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4.5 border-t border-slate-150 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-4.5 h-10 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors rounded-lg cursor-pointer uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
