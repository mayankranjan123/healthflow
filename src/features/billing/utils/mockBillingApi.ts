import { BillingInvoice, BillingStats, BillingInvoiceItem } from '../types';
import { billingService, InvoiceRequestDto, InvoiceItemRequestDto } from '../../../lib/apiClient';

function mapItemToFrontend(item: any): BillingInvoiceItem {
  return {
    id: item.id?.toString() || '',
    name: item.itemName || '',
    quantity: item.quantity || 1,
    rate: Number(item.rate || 0),
    discountPercent: Number(item.discountPercent || 0),
    taxPercent: Number(item.taxPercent || 0),
    total: Number(item.total || 0)
  };
}

function mapToFrontend(i: any): BillingInvoice {
  return {
    id: i.id.toString(),
    invoiceNumber: i.invoiceNumber,
    patientId: i.patientId.toString(),
    patientName: i.patientName,
    patientPhone: i.patientMobile || '',
    doctorId: i.doctorId.toString(),
    doctorName: i.doctorName,
    doctorSpecialization: 'General',
    date: i.invoiceDate || '',
    subtotal: Number(i.subtotal || 0),
    discountTotal: Number(i.discountTotal || 0),
    taxTotal: Number(i.taxTotal || 0),
    grandTotal: Number(i.grandTotal || 0),
    paidAmount: Number(i.paidAmount || 0),
    pendingAmount: Number(i.pendingAmount || 0),
    status: (i.status || 'Pending').toUpperCase() as any,
    paymentMode: i.paymentMode ? (i.paymentMode.toUpperCase() as any) : 'ONLINE',
    referenceNo: i.referenceNo || '',
    templateId: i.templateId || 'CLASSIC_MEDICAL',
    items: (i.items || []).map(mapItemToFrontend),
    createdAt: i.createdAt || ''
  };
}

function mapItemToBackend(item: BillingInvoiceItem): InvoiceItemRequestDto {
  return {
    itemName: item.name,
    quantity: item.quantity,
    rate: item.rate,
    discountPercent: item.discountPercent,
    taxPercent: item.taxPercent
  };
}

function mapToBackend(invoice: BillingInvoice): InvoiceRequestDto {
  return {
    patientId: invoice.patientId,
    doctorId: invoice.doctorId,
    invoiceDate: invoice.date || new Date().toISOString().split('T')[0],
    discountTotal: invoice.discountTotal,
    taxTotal: invoice.taxTotal,
    paidAmount: invoice.paidAmount,
    status: invoice.status === 'PAID' ? 'Paid' : invoice.status === 'PENDING' ? 'Pending' : 'Partial',
    paymentMode: invoice.paymentMode === 'CASH' ? 'Cash' : 'Online',
    referenceNo: invoice.referenceNo || undefined,
    templateId: invoice.templateId || 'CLASSIC_MEDICAL',
    items: (invoice.items || []).map(mapItemToBackend)
  };
}

export const mockBillingApi = {
  async getInvoices(params?: {
    pageNo?: number;
    pageSize?: number;
    patientSearch?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    doctorName?: string;
  }): Promise<any> {
    if (!params) {
      const data = await billingService.getInvoices(1000000000, { size: 1000 });
      return (data.content || []).map(mapToFrontend);
    }
    const res = await billingService.getInvoices(1000000000, {
      page: params.pageNo,
      size: params.pageSize,
      patientSearch: params.patientSearch,
      fromDate: params.fromDate,
      toDate: params.toDate,
      status: params.status === 'ALL' ? undefined : params.status,
      doctorName: params.doctorName === 'ALL' ? undefined : params.doctorName,
    });
    return {
      items: (res.content || []).map(mapToFrontend),
      totalItems: res.totalElements || 0,
      totalPages: res.totalPages || 1,
      pageNo: res.number || 0,
      pageSize: res.size || 10,
    };
  },

  async getInvoiceById(id: string): Promise<BillingInvoice | undefined> {
    try {
      const i = await billingService.getInvoiceById(id, 1);
      return mapToFrontend(i);
    } catch {
      return undefined;
    }
  },

  async addInvoice(invoice: BillingInvoice): Promise<void> {
    await billingService.createInvoice(1000000000, mapToBackend(invoice));
  },

  async getStats(): Promise<BillingStats> {
    const stats = await billingService.getStats(1000000000);
    return {
      revenueToday: Number(stats.revenueToday || 0),
      pendingPayments: Number(stats.pendingPayments || 0),
      paidInvoicesCount: Number(stats.paidInvoicesCount || 0),
      partialPaymentsCount: Number(stats.partialPaymentsCount || 0)
    };
  }
};
