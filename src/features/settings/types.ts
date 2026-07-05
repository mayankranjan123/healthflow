export interface ClinicSettings {
  logoUrl: string | null;
  name: string;
  phone: string;
  email: string;
  website: string;
  gstNumber?: string;
  registrationNumber?: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  currency: string;
  language: string;
}

export type InvoiceTemplateId = 'CLASSIC_MEDICAL' | 'MODERN_COMPACT' | 'GST_DETAILED' | 'MINIMAL_RECEIPT';

export interface BillingSettings {
  invoicePrefix: string;
  startingInvoiceNumber: number;
  receiptPrefix: string;
  autoGenerateInvoiceNumber: boolean;
  
  defaultTaxPercent: number;
  taxLabel: string;
  enableItemLevelTax: boolean;
  enableInvoiceLevelDiscount: boolean;
  enableItemLevelDiscount: boolean;
  gstNumberDisplay: boolean;
  roundOffAmount: boolean;

  selectedTemplateId: InvoiceTemplateId;

  showClinicLogo: boolean;
  showClinicAddress: boolean;
  showClinicContact: boolean;
  showGstOnHeader: boolean;
  showDoctorName: boolean;
  showPatientMobile: boolean;
  showPaymentSummary: boolean;
  showPendingAmount: boolean;
  showFooterMessage: boolean;
  showAuthorizedSignature: boolean;
  footerMessage: string;

  paperSize: 'A4' | 'A5';
  printOrientation: 'PORTRAIT' | 'LANDSCAPE';
  pdfFooterText: string;
  downloadFileNameFormat: string;
  autoDownloadAfterSave: boolean;
  showPrintButtonAfterGen: boolean;
}

export interface PrescriptionSettings {
  prefix: string;
  startingNumber: number;
  autoGenerateNumber: boolean;
  headerLayout: 'CLASSIC_LEFT' | 'CENTERED_PROFESSIONAL' | 'MODERN_MINIMAL';
  showClinicLogo: boolean;
  showDoctorQualifications: boolean;
  showDoctorDepartment: boolean;
  showVitals: boolean;
  showPatientHistory: boolean;
  showDiagnosis: boolean;
  showDuration: boolean;
  showDosageInstructions: boolean;
  defaultFooterNote: string;
}

export interface SettingsState {
  clinic: ClinicSettings;
  billing: BillingSettings;
  prescription: PrescriptionSettings;
}
