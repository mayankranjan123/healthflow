import { PaymentStatus } from '../../types';

export interface BillingInvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export interface BillingInvoice {
  id: string; // e.g., 'INV-1001'
  invoiceNumber: string; // same as id
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorDepartment?: string;
  date: string; // YYYY-MM-DD
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  status: PaymentStatus;
  paymentMode?: 'CASH' | 'ONLINE';
  referenceNo?: string;
  items: BillingInvoiceItem[];
  createdAt: string;
}

export interface BillingStats {
  revenueToday: number;
  pendingPayments: number;
  paidInvoicesCount: number;
  partialPaymentsCount: number;
}

export interface BillingFilters {
  patientOrInvoiceId: string;
  fromDate: string;
  toDate: string;
  status: PaymentStatus | 'ALL';
  doctorId: string;
}
