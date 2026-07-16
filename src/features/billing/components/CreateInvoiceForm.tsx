import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, X, Plus, Trash2, Save, Eye, Printer, 
  FileText, CheckCircle, HelpCircle, Landmark 
} from 'lucide-react';
import { mockPatientsApi } from '../../patients/utils/mockPatientsApi';
import { mockDoctorsApi } from '../../doctors/utils/mockDoctorsApi';
import { PatientProfileExtended } from '../../patients/types';
import { DoctorProfileExtended } from '../../doctors/types';
import { BillingInvoice, BillingInvoiceItem } from '../types';
import { mockSettingsApi } from '../../settings/utils/mockSettingsApi';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CreateInvoiceFormProps {
  nextInvoiceNumber: string;
  onSave: (invoice: BillingInvoice) => void;
  onCancel: () => void;
  onPreview: (invoice: BillingInvoice) => void;
}

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({
  nextInvoiceNumber,
  onSave,
  onCancel,
  onPreview,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Master lists
  const [patients, setPatients] = useState<PatientProfileExtended[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfileExtended[]>([]);

  // Search queries & results dropdown toggle
  const [patientQuery, setPatientQuery] = useState('');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Selections
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileExtended | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfileExtended | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(getTodayDateString());

  // Settings State
  const [billingSettings, setBillingSettings] = useState<any>(null);

  // Items State
  const [items, setItems] = useState<BillingInvoiceItem[]>([
    {
      id: '1',
      name: 'Consultation Fee',
      quantity: 1,
      rate: 500,
      discountPercent: 0,
      taxPercent: 18,
      total: 590,
    }
  ]);

  // Payment Details
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE'>('ONLINE');
  const [referenceNo, setReferenceNo] = useState('');
  const [amountReceived, setAmountReceived] = useState<number>(590);

  // Load lists and settings on mount
  useEffect(() => {
    mockPatientsApi.getPatients().then(setPatients);
    mockDoctorsApi.getDoctors().then(setDoctors);
    mockSettingsApi.getSettings().then((settings) => {
      if (settings && settings.billing) {
        setBillingSettings(settings.billing);
        const defaultTax = settings.billing.defaultTaxPercent ?? 18;
        const initialTotal = 500 + 500 * (defaultTax / 100);
        setItems([
          {
            id: '1',
            name: 'Consultation Fee',
            quantity: 1,
            rate: 500,
            discountPercent: 0,
            taxPercent: defaultTax,
            total: parseFloat(initialTotal.toFixed(2)),
          }
        ]);
        setAmountReceived(parseFloat(initialTotal.toFixed(2)));
      }
    });
  }, []);

  // Filter patients based on query
  const filteredPatients = patients.filter((pat) => {
    if (!patientQuery.trim()) return true;
    const q = patientQuery.toLowerCase();
    return (
      pat.firstName.toLowerCase().includes(q) ||
      pat.lastName.toLowerCase().includes(q) ||
      pat.id.toLowerCase().includes(q) ||
      pat.phone.toLowerCase().includes(q)
    );
  });

  // Filter doctors based on query
  const filteredDoctors = doctors.filter((doc) => {
    if (!doctorQuery.trim()) return true;
    const q = doctorQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.id.toLowerCase().includes(q) ||
      doc.mobile.toLowerCase().includes(q)
    );
  });

  // Auto reference number if online is selected
  useEffect(() => {
    if (paymentMode === 'ONLINE' && !referenceNo) {
      setReferenceNo(`TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    } else if (paymentMode === 'CASH') {
      setReferenceNo('');
    }
  }, [paymentMode]);

  // Calculate row total helper
  const calculateRowTotal = (qty: number, rate: number, disc: number, tax: number) => {
    const base = qty * rate;
    const discount = base * (disc / 100);
    const subtotalAfterDiscount = base - discount;
    const taxAmount = subtotalAfterDiscount * (tax / 100);
    return parseFloat((subtotalAfterDiscount + taxAmount).toFixed(2));
  };

  // Manage invoice items change
  const handleItemChange = (id: string, field: keyof BillingInvoiceItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };
      
      // Re-calculate row total
      const qty = field === 'quantity' ? Number(value) : updated.quantity;
      let rate = field === 'rate' ? Number(value) : updated.rate;
      const disc = field === 'discountPercent' ? Number(value) : updated.discountPercent;
      const tax = field === 'taxPercent' ? Number(value) : updated.taxPercent;

      // Auto-prefill fee if name changes to Consultation Fee or Follow-up Fee
      if (field === 'name' && selectedDoctor) {
        const lowerName = value.toLowerCase().trim();
        if (lowerName === 'consultation fee') {
          rate = selectedDoctor.fee || 100;
          updated.rate = rate;
        } else if (lowerName === 'follow-up fee' || lowerName === 'followup fee' || lowerName === 'follow-up charges' || lowerName === 'followup charges') {
          rate = selectedDoctor.followupFee || 60;
          updated.rate = rate;
        }
      }

      updated.total = calculateRowTotal(qty, rate, disc, tax);
      return updated;
    });

    setItems(updatedItems);
  };

  const handleAddItem = () => {
    const newId = (items.reduce((max, i) => Math.max(max, parseInt(i.id) || 0), 0) + 1).toString();
    const defaultTax = billingSettings?.defaultTaxPercent ?? 18;
    setItems([
      ...items,
      {
        id: newId,
        name: 'Clinical Service',
        quantity: 1,
        rate: 250,
        discountPercent: 0,
        taxPercent: defaultTax,
        total: parseFloat((250 + 250 * (defaultTax / 100)).toFixed(2)),
      }
    ]);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) return; // keep at least one
    setItems(items.filter((item) => item.id !== id));
  };

  // Summary Totals calculation
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discountTotal = items.reduce((sum, item) => {
    const base = item.quantity * item.rate;
    return sum + base * (item.discountPercent / 100);
  }, 0);
  const taxTotal = items.reduce((sum, item) => {
    const base = item.quantity * item.rate;
    const sub = base - base * (item.discountPercent / 100);
    return sum + sub * (item.taxPercent / 100);
  }, 0);
  
  const grandTotal = parseFloat((subtotal - discountTotal + taxTotal).toFixed(2));
  const pendingAmount = parseFloat((grandTotal - amountReceived).toFixed(2));

  // Determine invoice status based on payment received
  let invoiceStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
  if (amountReceived >= grandTotal) {
    invoiceStatus = 'PAID';
  } else if (amountReceived > 0) {
    invoiceStatus = 'PARTIAL';
  }

  // Auto update amount received to match grand total when item changes if user wants to pay fully
  const handlePayInFull = () => {
    setAmountReceived(grandTotal);
  };

  // Construct final invoice object
  const buildInvoiceObject = (): BillingInvoice => {
    return {
      id: nextInvoiceNumber,
      invoiceNumber: nextInvoiceNumber,
      patientId: selectedPatient ? selectedPatient.id : 'PAT-TEMP',
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Walk-in Patient',
      patientPhone: selectedPatient ? selectedPatient.phone : '+91 99999 99999',
      patientEmail: selectedPatient ? selectedPatient.email : 'walkin@healthflow.com',
      doctorId: selectedDoctor ? selectedDoctor.id : 'DOC-GEN',
      doctorName: selectedDoctor ? selectedDoctor.name : 'Dr. General Duty',
      doctorSpecialization: selectedDoctor ? selectedDoctor.specialization : 'General Practice',
      doctorDepartment: 'Clinical OPD',
      date: invoiceDate,
      templateId: billingSettings?.selectedTemplateId || 'CLASSIC_MEDICAL',
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      paidAmount: amountReceived,
      pendingAmount: pendingAmount < 0 ? 0 : pendingAmount,
      status: invoiceStatus,
      paymentMode: paymentMode,
      referenceNo: paymentMode === 'ONLINE' ? referenceNo : undefined,
      items,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSaveInvoice = () => {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (!selectedDoctor) {
      alert('Please select a doctor first.');
      return;
    }
    if (invoiceDate > getTodayDateString()) {
      alert('Invoice date cannot be in the future.');
      return;
    }
    onSave(buildInvoiceObject());
  };

  const handlePreviewInvoice = () => {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (!selectedDoctor) {
      alert('Please select a doctor first.');
      return;
    }
    if (invoiceDate > getTodayDateString()) {
      alert('Invoice date cannot be in the future.');
      return;
    }
    onPreview(buildInvoiceObject());
  };

  return (
    <div className="space-y-6">
      {/* Back button and page intro */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider hover:text-indigo-700 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Billing</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Create Invoice
              <span className="text-sm font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                {nextInvoiceNumber}
              </span>
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Add patient, doctor, invoice items and collect payment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Left (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient and Doctor selectors card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Details */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patient Details
                </label>
                {!selectedPatient ? (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Patient by Name or ID..."
                        value={patientQuery}
                        onFocus={() => setShowPatientDropdown(true)}
                        onChange={(e) => {
                          setPatientQuery(e.target.value);
                          setShowPatientDropdown(true);
                        }}
                        className="w-full pl-9 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                      />
                    </div>
                    {/* Patient Dropdown results */}
                    {showPatientDropdown && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-25 max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">No patients found</div>
                        ) : (
                          filteredPatients.map((pat) => (
                            <div
                              key={pat.id}
                              onClick={() => {
                                setSelectedPatient(pat);
                                setShowPatientDropdown(false);
                                setPatientQuery('');
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{pat.firstName} {pat.lastName}</span>
                                <span className="text-xs text-slate-400 font-mono font-semibold">{pat.phone}</span>
                              </div>
                              <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                {pat.id}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/20 rounded-lg h-11">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-slate-800 text-sm">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="font-bold bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded shrink-0">
                            {selectedPatient.id}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{selectedPatient.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="p-1 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Doctor Details */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Doctor Details
                </label>
                {!selectedDoctor ? (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Doctor by Name..."
                        value={doctorQuery}
                        onFocus={() => setShowDoctorDropdown(true)}
                        onChange={(e) => {
                          setDoctorQuery(e.target.value);
                          setShowDoctorDropdown(true);
                        }}
                        className="w-full pl-9 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                      />
                    </div>
                    {/* Doctor Dropdown results */}
                    {showDoctorDropdown && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-25 max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredDoctors.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">No doctors found</div>
                        ) : (
                          filteredDoctors.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setShowDoctorDropdown(false);
                                setDoctorQuery('');
                                // Automatically pre-fill rate of Consultation Fee or Follow-up Fee based on item name
                                if (items.length > 0) {
                                  const updatedItems = items.map((item) => {
                                    const lowerName = item.name.toLowerCase().trim();
                                    let newRate = item.rate;
                                    if (lowerName === 'consultation fee') {
                                      newRate = doc.fee || 100;
                                    } else if (lowerName === 'follow-up fee' || lowerName === 'followup fee' || lowerName === 'follow-up charges' || lowerName === 'followup charges') {
                                      newRate = doc.followupFee || 60;
                                    }
                                    return {
                                      ...item,
                                      rate: newRate,
                                      total: calculateRowTotal(item.quantity, newRate, item.discountPercent, item.taxPercent)
                                    };
                                  });
                                  setItems(updatedItems);
                                }
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{doc.name}</span>
                                <span className="text-xs text-slate-400">{doc.specialization}</span>
                              </div>
                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                  Done: {doc.totalConsultations}
                                </span>
                                <span className="text-xs font-bold font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                                  ₹{doc.fee}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-emerald-100 bg-emerald-50/20 rounded-lg h-11">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                        🩺
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-slate-800 text-sm">
                          {selectedDoctor.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="font-bold bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded shrink-0">
                            {selectedDoctor.id}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{selectedDoctor.specialization}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className="p-1 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Click outside to close helper overlays */}
            {(showPatientDropdown || showDoctorDropdown) && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => {
                  setShowPatientDropdown(false);
                  setShowDoctorDropdown(false);
                }}
              />
            )}

            {/* Invoice Date */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  max={getTodayDateString()}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items Section */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base uppercase tracking-wider text-xs">Invoice Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 bg-[#005ae2] hover:bg-blue-700 text-white rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {!isMobile ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-16 text-center">
                        Qty
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">
                        Rate (₹)
                      </th>
                      {billingSettings?.selectedTemplateId === 'GST_DETAILED' ? (
                        <>
                          <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20 text-center">
                            CGST %
                          </th>
                          <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20 text-center">
                            SGST %
                          </th>
                        </>
                      ) : (
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20">
                          {billingSettings?.taxLabel || 'Tax'} %
                        </th>
                      )}
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">
                        Total
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 tracking-wider text-center w-12">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {items.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/30">
                        {/* Name */}
                        <td className="p-3">
                          <select
                            value={row.name}
                            onChange={(e) => handleItemChange(row.id, 'name', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 font-medium cursor-pointer"
                          >
                            <option value="Consultation Fee">Consultation Fee</option>
                            <option value="Follow-up Charges">Follow-up Charges</option>
                            <option value="Lab Charges - CBC">Lab Charges - CBC</option>
                            <option value="X-Ray Chest">X-Ray Chest</option>
                            <option value="Clinical Treatment">Clinical Treatment</option>
                            <option value="Pharmacy Medicines">Pharmacy Medicines</option>
                            <option value="Other Medical Service">Other Medical Service</option>
                          </select>
                        </td>

                        {/* Qty */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(row.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 text-center font-semibold font-mono"
                          />
                        </td>

                        {/* Rate */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={row.rate}
                            onChange={(e) => handleItemChange(row.id, 'rate', Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 font-semibold font-mono"
                          />
                        </td>

                        {/* Tax % / CGST & SGST */}
                        {billingSettings?.selectedTemplateId === 'GST_DETAILED' ? (
                          <>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.1"
                                value={(row.taxPercent / 2).toFixed(1)}
                                onChange={(e) => handleItemChange(row.id, 'taxPercent', Number(e.target.value) * 2)}
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 text-center font-medium font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.1"
                                value={(row.taxPercent / 2).toFixed(1)}
                                onChange={(e) => handleItemChange(row.id, 'taxPercent', Number(e.target.value) * 2)}
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 text-center font-medium font-mono"
                              />
                            </td>
                          </>
                        ) : (
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.taxPercent}
                              onChange={(e) => handleItemChange(row.id, 'taxPercent', Math.min(100, Math.max(0, Number(e.target.value))))}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-brand-primary focus:bg-white text-slate-700 text-center font-medium font-mono"
                            />
                          </td>
                        )}

                        {/* Total */}
                        <td className="p-3 text-right font-bold text-slate-800 font-mono text-sm">
                          ₹{row.total.toFixed(2)}
                        </td>

                        {/* Delete */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(row.id)}
                            disabled={items.length <= 1}
                            className={`p-1.5 rounded transition-colors ${
                              items.length <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 space-y-4 bg-slate-50/50">
                {items.map((row) => (
                  <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 animate-scale-in">
                    {/* Item Description & Delete Header */}
                    <div className="flex items-center gap-3">
                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Description</label>
                        <select
                          value={row.name}
                          onChange={(e) => handleItemChange(row.id, 'name', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-800 font-bold appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%234A5568%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat cursor-pointer focus:bg-white"
                        >
                          <option value="Consultation Fee">Consultation Fee</option>
                          <option value="Follow-up Charges">Follow-up Charges</option>
                          <option value="Lab Charges - CBC">Lab Charges - CBC</option>
                          <option value="X-Ray Chest">X-Ray Chest</option>
                          <option value="Clinical Treatment">Clinical Treatment</option>
                          <option value="Pharmacy Medicines">Pharmacy Medicines</option>
                          <option value="Other Medical Service">Other Medical Service</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(row.id)}
                        disabled={items.length <= 1}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors mt-5 shrink-0 cursor-pointer ${
                          items.length <= 1
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-transparent'
                            : 'text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 bg-white'
                        }`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Inputs Row: QTY, RATE, GST */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Qty */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleItemChange(row.id, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-center font-bold text-slate-800 focus:bg-white"
                        />
                      </div>

                      {/* Rate */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={row.rate}
                          onChange={(e) => handleItemChange(row.id, 'rate', Math.max(0, Number(e.target.value)))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold text-slate-800 focus:bg-white"
                        />
                      </div>

                      {/* Tax % */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {billingSettings?.selectedTemplateId === 'GST_DETAILED' ? 'GST %' : (billingSettings?.taxLabel || 'GST') + ' %'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.taxPercent}
                          onChange={(e) => handleItemChange(row.id, 'taxPercent', Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-center font-bold text-slate-800 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Block Total Display */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Row Total</span>
                      <span className="font-bold text-slate-800 font-mono">₹{row.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base">Payment Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payment Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 h-11 flex-1 hover:bg-slate-100/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'CASH'}
                      onChange={() => setPaymentMode('CASH')}
                      className="w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary accent-indigo-600"
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 h-11 flex-1 hover:bg-slate-100/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'ONLINE'}
                      onChange={() => setPaymentMode('ONLINE')}
                      className="w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary accent-indigo-600"
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>

              {/* Amount Received */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Amount Received (₹)
                  </label>
                  <button
                    type="button"
                    onClick={handlePayInFull}
                    className="text-[10px] font-bold text-brand-primary uppercase hover:underline"
                  >
                    Pay In Full
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold font-mono outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Reference No / Transaction ID */}
            {paymentMode === 'ONLINE' && (
              <div className="space-y-1.5 max-w-md">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reference No / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-9982736412"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold font-mono outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all text-slate-800"
                />
              </div>
            )}

            {/* Dynamic collection helper text */}
            <div className="pt-2 text-xs font-medium text-slate-400 italic">
              {amountReceived === 0 && '* Marking invoice as fully pending.'}
              {amountReceived > 0 && amountReceived < grandTotal && `* Collecting partial payment for this invoice (outstanding: ₹${pendingAmount})`}
              {amountReceived >= grandTotal && '* Full payment settled for this invoice.'}
            </div>
          </div>
        </div>

        {/* Sidebar Summary Card (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Title */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">
                Invoice Summary
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider font-mono ${
                invoiceStatus === 'PAID' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : invoiceStatus === 'PARTIAL'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {invoiceStatus}
              </span>
            </div>

            {/* Details and math list */}
            <div className="p-5 space-y-3.5">
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-700">₹{subtotal.toFixed(2)}</span>
              </div>
              {billingSettings?.enableInvoiceLevelDiscount && (
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Discount</span>
                  <span className="font-mono text-rose-500">- ₹{discountTotal.toFixed(2)}</span>
                </div>
              )}
              {billingSettings?.selectedTemplateId === 'GST_DETAILED' ? (
                <>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>CGST</span>
                    <span className="font-mono text-slate-700">₹{(taxTotal / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500 pb-3 border-b border-dashed border-slate-150">
                    <span>SGST</span>
                    <span className="font-mono text-slate-700">₹{(taxTotal / 2).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm font-medium text-slate-500 pb-3 border-b border-dashed border-slate-150">
                  <span>{billingSettings?.taxLabel || 'Tax'}</span>
                  <span className="font-mono text-slate-700">₹{taxTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 pb-3 border-b border-dashed border-slate-150">
                <span>Grand Total</span>
                <span className="font-mono text-lg text-indigo-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-600">₹{amountReceived.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Balance Pending:</span>
                  <span className={`font-mono font-bold ${pendingAmount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                    ₹{(pendingAmount < 0 ? 0 : pendingAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions list inside summary block */}
              <div className="pt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm h-11 rounded-lg flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                >
                  <Save className="w-4.5 h-4.5" />
                  <span>Save Invoice</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePreviewInvoice}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Simulating direct print dialog! Generating paper print copy...');
                      window.print();
                    }}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info box below */}
          <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-500 leading-relaxed">
            <span className="text-slate-400 shrink-0 text-base">ℹ️</span>
            <div>
              <p className="font-semibold text-slate-600 mb-0.5">Payment Terms Note</p>
              Invoices saved as <strong className="text-indigo-600 font-semibold">Partial</strong> or <strong className="text-rose-500 font-semibold">Pending</strong> will be tracked in outstanding reports and have automatic notifications enabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
