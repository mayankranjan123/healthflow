import { SettingsState, ClinicSettings, BillingSettings, PrescriptionSettings } from '../types';

const defaultSettings: SettingsState = {
  clinic: {
    logoUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80', // Beautiful soft custom placeholder
    name: 'HealthFlow',
    phone: '+1 (555) 000-1234',
    email: 'contact@healthflow.clinic',
    website: 'www.healthflow.clinic',
    gstNumber: '22AAAAA0000A1Z5',
    registrationNumber: 'REG-2023-88910',
    addressLine: '452 Innovation Blvd, Suite 200',
    city: 'Palo Alto',
    state: 'California',
    country: 'United States',
    pincode: '94301',
    currency: 'USD ($)',
    language: 'English',
  },
  billing: {
    invoicePrefix: 'INV',
    startingInvoiceNumber: 1001,
    receiptPrefix: 'RCP',
    autoGenerateInvoiceNumber: true,
    
    defaultTaxPercent: 18,
    taxLabel: 'GST',
    enableItemLevelTax: true,
    enableInvoiceLevelDiscount: true,
    enableItemLevelDiscount: false,
    gstNumberDisplay: true,
    roundOffAmount: true,

    selectedTemplateId: 'CLASSIC_MEDICAL',

    showClinicLogo: true,
    showClinicAddress: true,
    showClinicContact: true,
    showGstOnHeader: true,
    showDoctorName: true,
    showPatientMobile: true,
    showPaymentSummary: true,
    showPendingAmount: true,
    showFooterMessage: true,
    showAuthorizedSignature: true,
    footerMessage: 'Thank you for visiting HealthFlow. Wish you a speedy recovery!',

    paperSize: 'A4',
    printOrientation: 'PORTRAIT',
    pdfFooterText: 'HealthFlow Specialty Clinic - Electronic Statement',
    downloadFileNameFormat: 'INV-[NUMBER]_[PATIENT]',
    autoDownloadAfterSave: false,
    showPrintButtonAfterGen: true,
  },
  prescription: {
    prefix: 'RX',
    startingNumber: 1001,
    autoGenerateNumber: true,
    headerLayout: 'CENTERED_PROFESSIONAL',
    showClinicLogo: true,
    showDoctorQualifications: true,
    showDoctorDepartment: true,
    showVitals: true,
    showPatientHistory: true,
    showDiagnosis: true,
    showDuration: true,
    showDosageInstructions: true,
    defaultFooterNote: 'Please take medicines on time and review if symptoms persist.',
  }
};

const STORAGE_KEY = 'healthflow_clinic_settings_v1';

export const mockSettingsApi = {
  getSettings: (): SettingsState => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error reading settings cache', e);
    }
    return defaultSettings;
  },

  saveSettings: (settings: SettingsState): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error writing settings cache', e);
    }
  },

  updateClinicSettings: (clinic: ClinicSettings): SettingsState => {
    const current = mockSettingsApi.getSettings();
    const updated = { ...current, clinic };
    mockSettingsApi.saveSettings(updated);
    return updated;
  },

  updateBillingSettings: (billing: BillingSettings): SettingsState => {
    const current = mockSettingsApi.getSettings();
    const updated = { ...current, billing };
    mockSettingsApi.saveSettings(updated);
    return updated;
  },

  updatePrescriptionSettings: (prescription: PrescriptionSettings): SettingsState => {
    const current = mockSettingsApi.getSettings();
    const updated = { ...current, prescription };
    mockSettingsApi.saveSettings(updated);
    return updated;
  }
};
