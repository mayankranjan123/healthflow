import { SettingsState, ClinicSettings, BillingSettings, PrescriptionSettings } from '../types';
import { clinicService } from '../../../lib/apiClient';

const defaultSettings: SettingsState = {
  clinic: {
    logoUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80', // Beautiful soft custom placeholder
    name: 'HealthFlow',
    phone: '+91 98765 00001',
    email: 'contact@healthflow.clinic',
    website: 'www.healthflow.clinic',
    gstNumber: '22AAAAA0000A1Z5',
    registrationNumber: 'REG-2023-88910',
    addressLine: '452 Innovation Blvd, Suite 200',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110001',
    currency: 'INR (₹)',
    language: 'English (India)',
  },
  billing: {
    invoicePrefix: 'INV',
    startingInvoiceNumber: 1001,
    autoGenerateInvoiceNumber: true,
    
    defaultTaxPercent: 18,
    taxLabel: 'GST',
    enableItemLevelTax: true,
    enableInvoiceLevelDiscount: true,

    selectedTemplateId: 'CLASSIC_MEDICAL',

    showClinicLogo: true,
    showClinicAddress: true,
    showClinicContact: true,
    showDoctorName: true,
    showPatientMobile: true,
    showPaymentSummary: true,
    showFooterMessage: true,
    showAuthorizedSignature: true,
    footerMessage: 'Thank you for visiting HealthFlow. Wish you a speedy recovery!',
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

let cachedSettingsState: SettingsState | null = null;
let activeGetSettingsPromise: Promise<SettingsState> | null = null;
let activeClinicPromise: Promise<ClinicSettings> | null = null;
let activeBillingPromise: Promise<BillingSettings> | null = null;
let activePrescriptionPromise: Promise<PrescriptionSettings> | null = null;

export const mockSettingsApi = {
  getClinicSettings(): Promise<ClinicSettings> {
    if (cachedSettingsState && cachedSettingsState.clinic) {
      return Promise.resolve(cachedSettingsState.clinic);
    }
    if (activeClinicPromise) {
      return activeClinicPromise;
    }
    activeClinicPromise = (async () => {
      let clinic = defaultSettings.clinic;
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.clinic) clinic = parsed.clinic;
        }
      } catch (e) {}

      try {
        const dbClinic = await clinicService.getClinicSettings(1000000000);
        if (dbClinic) {
          clinic = dbClinic;
        }
      } catch (e) {
        console.warn("Failed to fetch clinic settings from backend.", e);
      }

      // Update cached state in localStorage
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const current = cached ? JSON.parse(cached) : defaultSettings;
        const updated = { ...current, clinic };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (cachedSettingsState) {
          cachedSettingsState.clinic = clinic;
        }
      } catch (e) {}

      setTimeout(() => {
        activeClinicPromise = null;
      }, 1000);

      return clinic;
    })();
    return activeClinicPromise;
  },

  getBillingSettings(): Promise<BillingSettings> {
    if (cachedSettingsState && cachedSettingsState.billing) {
      return Promise.resolve(cachedSettingsState.billing);
    }
    if (activeBillingPromise) {
      return activeBillingPromise;
    }
    activeBillingPromise = (async () => {
      let billing = defaultSettings.billing;
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.billing) billing = parsed.billing;
        }
      } catch (e) {}

      try {
        const dbBilling = await clinicService.getBillingSettings(1000000000);
        if (dbBilling) {
          billing = dbBilling;
        }
      } catch (e) {
        console.warn("Failed to fetch billing settings from backend.", e);
      }

      // Update cached state in localStorage
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const current = cached ? JSON.parse(cached) : defaultSettings;
        const updated = { ...current, billing };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (cachedSettingsState) {
          cachedSettingsState.billing = billing;
        }
      } catch (e) {}

      setTimeout(() => {
        activeBillingPromise = null;
      }, 1000);

      return billing;
    })();
    return activeBillingPromise;
  },

  getPrescriptionSettings(): Promise<PrescriptionSettings> {
    if (cachedSettingsState && cachedSettingsState.prescription) {
      return Promise.resolve(cachedSettingsState.prescription);
    }
    if (activePrescriptionPromise) {
      return activePrescriptionPromise;
    }
    activePrescriptionPromise = (async () => {
      let prescription = defaultSettings.prescription;
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.prescription) prescription = parsed.prescription;
        }
      } catch (e) {}

      try {
        const dbPrescription = await clinicService.getPrescriptionSettings(1000000000);
        if (dbPrescription) {
          prescription = dbPrescription;
        }
      } catch (e) {
        console.warn("Failed to fetch prescription settings from backend.", e);
      }

      // Update cached state in localStorage
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const current = cached ? JSON.parse(cached) : defaultSettings;
        const updated = { ...current, prescription };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (cachedSettingsState) {
          cachedSettingsState.prescription = prescription;
        }
      } catch (e) {}

      setTimeout(() => {
        activePrescriptionPromise = null;
      }, 1000);

      return prescription;
    })();
    return activePrescriptionPromise;
  },

  getSettings(): Promise<SettingsState> {
    if (cachedSettingsState) {
      return Promise.resolve(cachedSettingsState);
    }
    if (activeGetSettingsPromise) {
      return activeGetSettingsPromise;
    }

    activeGetSettingsPromise = (async () => {
      let local: SettingsState = defaultSettings;
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          local = JSON.parse(cached);
        }
      } catch (e) {}

      try {
        const dbClinic = await clinicService.getClinicSettings(1000000000);
        if (dbClinic) {
          local = { ...local, clinic: dbClinic };
        }
      } catch (e) {
        console.warn("Failed to fetch clinic settings from backend.", e);
      }

      try {
        const dbBilling = await clinicService.getBillingSettings(1000000000);
        if (dbBilling) {
          local = { ...local, billing: dbBilling };
        }
      } catch (e) {
        console.warn("Failed to fetch billing settings from backend.", e);
      }

      try {
        const dbPrescription = await clinicService.getPrescriptionSettings(1000000000);
        if (dbPrescription) {
          local = { ...local, prescription: dbPrescription };
        }
      } catch (e) {
        console.warn("Failed to fetch prescription settings from backend.", e);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      cachedSettingsState = local;
      activeGetSettingsPromise = null;

      return local;
    })();

    return activeGetSettingsPromise;
  },

  async updateClinicSettings(clinic: ClinicSettings): Promise<SettingsState> {
    try {
      await clinicService.updateClinicSettings(1000000000, clinic);
    } catch (e) {
      console.error("Failed to update clinic settings on backend", e);
    }

    let local: SettingsState = defaultSettings;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        local = JSON.parse(cached);
      }
    } catch (e) {}

    const updated = { ...local, clinic };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedSettingsState = updated;
    return updated;
  },

  async updateBillingSettings(billing: BillingSettings): Promise<SettingsState> {
    try {
      await clinicService.updateBillingSettings(1000000000, billing);
    } catch (e) {
      console.error("Failed to update billing settings on backend", e);
    }

    let local: SettingsState = defaultSettings;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        local = JSON.parse(cached);
      }
    } catch (e) {}

    const updated = { ...local, billing };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedSettingsState = updated;
    return updated;
  },

  async updatePrescriptionSettings(prescription: PrescriptionSettings): Promise<SettingsState> {
    try {
      await clinicService.updatePrescriptionSettings(1000000000, prescription);
    } catch (e) {
      console.error("Failed to update prescription settings on backend", e);
    }

    let local: SettingsState = defaultSettings;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        local = JSON.parse(cached);
      }
    } catch (e) {}

    const updated = { ...local, prescription };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedSettingsState = updated;
    return updated;
  }
};
