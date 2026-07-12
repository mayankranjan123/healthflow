import axios from 'axios';

// Resolve API base URL based on environment context
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token securely on all requests
apiClient.interceptors.request.use(
  (config) => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Failed to parse cached authentication token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handler & Session Expiry Detection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if ((status === 401 || status === 403) && !isLoginRequest) {
        // Token has expired or is invalid - clear session to force re-login
        localStorage.removeItem('healthflow_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. PATIENT DTOs & SERVICES (PatientController)
// ==========================================

export interface PatientRequestDto {
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  mobile: string;
  email?: string;
  profileImageUrl?: string;
  purpose?: string;
  allergies?: string;
  dateOfBirth: string; // LocalDate (YYYY-MM-DD)
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  existingDiseases?: string;
  clinicalNotes?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

export interface PatientResponseDto {
  id: number | string;
  clinicId: number | string;
  patientCode: string;
  profileImageUrl?: string;
  fullName: string;
  gender: string;
  mobile: string;
  email?: string;
  purpose?: string;
  allergies?: string;
  dateOfBirth: string; // LocalDate
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  existingDiseases?: string;
  clinicalNotes?: string;
  lastVisit?: string; // Instant (ISO String)
  nextVisit?: string; // Instant (ISO String)
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MobileCheckResultDto {
  duplicate: boolean;
  message: string;
  existingPatientId?: number | string;
}

export const patientService = {
  createPatient: async (clinicId: number = 1, request: PatientRequestDto) => {
    const response = await apiClient.post<{ data: PatientResponseDto }>(
      `/patients?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  updatePatient: async (patientId: number | string, clinicId: number = 1, request: PatientRequestDto) => {
    const response = await apiClient.put<{ data: PatientResponseDto }>(
      `/patients/${patientId}?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getPatientById: async (patientId: number | string, clinicId: number = 1) => {
    const response = await apiClient.get<{ data: PatientResponseDto }>(
      `/patients/${patientId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getPatients: async (
    clinicId: number = 1,
    params: {
      search?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    } = {}
  ) => {
    const response = await apiClient.get<{
      data: {
        content: PatientResponseDto[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      };
    }>(`/patients`, {
      params: {
        clinicId,
        search: params.search,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'id',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return response.data.data;
  },

  checkMobileDuplicate: async (mobile: string, clinicId: number = 1) => {
    const response = await apiClient.get<{ data: MobileCheckResultDto }>(
      `/patients/check-mobile`,
      {
        params: { mobile, clinicId },
      }
    );
    return response.data.data;
  },

  deletePatient: async (patientId: number, clinicId: number = 1) => {
    const response = await apiClient.delete<{ message: string }>(
      `/patients/${patientId}?clinicId=${clinicId}`
    );
    return response.data;
  },

  updateStatus: async (patientId: number, status: string, clinicId: number = 1) => {
    const response = await apiClient.patch<{ data: PatientResponseDto }>(
      `/patients/${patientId}/status`,
      null,
      {
        params: { status, clinicId },
      }
    );
    return response.data.data;
  },
};

// ==========================================
// 2. APPOINTMENT DTOs & SERVICES (AppointmentController)
// ==========================================

export interface AppointmentRequestDto {
  patientId: number | string;
  doctorId: number | string;
  appointmentDateTime: string; // Instant (ISO String)
  appointmentReason: string;
  visitType?: string;
}

export interface AppointmentCancelRequestDto {
  cancellationReason: string;
}

export interface AppointmentResponseDto {
  id: number | string;
  clinicId: number | string;
  appointmentCode: string;
  appointmentDateTime: string;
  patientId: number | string;
  patientName: string;
  patientMobile: string;
  doctorId: number | string;
  doctorName: string;
  doctorSpecialization: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  appointmentReason: string;
  cancellationReason?: string;
  visitType?: string;
  createdAt: string;
  updatedAt: string;
}

export const appointmentService = {
  createAppointment: async (clinicId: number = 1, request: AppointmentRequestDto) => {
    const response = await apiClient.post<{ data: AppointmentResponseDto }>(
      `/appointments?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getAppointmentById: async (appointmentId: number | string, clinicId: number = 1) => {
    const response = await apiClient.get<{ data: AppointmentResponseDto }>(
      `/appointments/${appointmentId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getAppointments: async (
    clinicId: number = 1,
    params: {
      doctorId?: number | string;
      status?: string;
      fromDate?: string; // Instant ISO
      toDate?: string; // Instant ISO
      patient?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    } = {}
  ) => {
    const response = await apiClient.get<{
      data: {
        content: AppointmentResponseDto[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      };
    }>(`/appointments`, {
      params: {
        clinicId,
        doctor: params.doctorId,
        status: params.status,
        fromDate: params.fromDate,
        toDate: params.toDate,
        patient: params.patient,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'appointmentDateTime',
        sortDir: params.sortDir ?? 'asc',
      },
    });
    return response.data.data;
  },

  updateAppointment: async (
    appointmentId: number | string,
    clinicId: number = 1,
    request: AppointmentRequestDto
  ) => {
    const response = await apiClient.put<{ data: AppointmentResponseDto }>(
      `/appointments/${appointmentId}?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  cancelAppointment: async (
    appointmentId: number | string,
    clinicId: number = 1,
    request: AppointmentCancelRequestDto
  ) => {
    const response = await apiClient.post<{ data: AppointmentResponseDto }>(
      `/appointments/${appointmentId}/cancel?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  completeAppointment: async (
    appointmentId: number | string,
    clinicId: number = 1
  ) => {
    const response = await apiClient.post<{ data: AppointmentResponseDto }>(
      `/appointments/${appointmentId}/complete?clinicId=${clinicId}`
    );
    return response.data.data;
  },
};

// ==========================================
// 3. BILLING/INVOICE DTOs & SERVICES (InvoiceController)
// ==========================================

export interface InvoiceItemRequestDto {
  itemName: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  taxPercent?: number;
}

export interface InvoiceRequestDto {
  patientId: number | string;
  doctorId: number | string;
  invoiceDate: string; // LocalDate
  discountTotal?: number;
  taxTotal?: number;
  paidAmount?: number;
  status: 'Paid' | 'Pending' | 'Partial';
  paymentMode?: 'Cash' | 'Online';
  referenceNo?: string;
  templateId?: string;
  items: InvoiceItemRequestDto[];
}

export interface InvoiceItemResponseDto {
  id: number | string;
  invoiceId: number | string;
  itemName: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export interface InvoiceResponseDto {
  id: number | string;
  clinicId: number | string;
  invoiceNumber: string;
  patientId: number | string;
  patientName: string;
  patientMobile: string;
  doctorId: number | string;
  doctorName: string;
  invoiceDate: string; // LocalDate
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  paymentMode?: 'Cash' | 'Online';
  referenceNo?: string;
  items: InvoiceItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStatsDto {
  revenueToday: number;
  pendingPayments: number;
  paidInvoicesCount: number;
  partialPaymentsCount: number;
}

export const billingService = {
  createInvoice: async (clinicId: number = 1, request: InvoiceRequestDto) => {
    const response = await apiClient.post<{ data: InvoiceResponseDto }>(
      `/invoices?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getInvoiceById: async (invoiceId: number | string, clinicId: number = 1) => {
    const response = await apiClient.get<{ data: InvoiceResponseDto }>(
      `/invoices/${invoiceId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getInvoices: async (
    clinicId: number = 1,
    params: {
      patientName?: string;
      invoiceNumber?: string;
      fromDate?: string; // LocalDate
      toDate?: string; // LocalDate
      paymentStatus?: string;
      doctorId?: number | string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    } = {}
  ) => {
    const response = await apiClient.get<{
      data: {
        content: InvoiceResponseDto[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      };
    }>(`/invoices`, {
      params: {
        clinicId,
        patientName: params.patientName,
        invoiceNumber: params.invoiceNumber,
        fromDate: params.fromDate,
        toDate: params.toDate,
        paymentStatus: params.paymentStatus,
        doctor: params.doctorId,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'id',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return response.data.data;
  },

  getStats: async (clinicId: number = 1) => {
    const response = await apiClient.get<{ data: InvoiceStatsDto }>(
      `/invoices/stats`,
      {
        params: { clinicId },
      }
    );
    return response.data.data;
  },

  previewInvoice: async (clinicId: number = 1, request: InvoiceRequestDto) => {
    const response = await apiClient.post<{ data: InvoiceResponseDto }>(
      `/invoices/preview?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  generatePdf: async (invoiceId: number, clinicId: number = 1) => {
    const response = await apiClient.post<{ data: { pdfUrl: string } }>(
      `/invoices/${invoiceId}/pdf?clinicId=${clinicId}`
    );
    return response.data.data;
  },
};

// ==========================================
// 4. PRESCRIPTION DTOs & SERVICES (PrescriptionController)
// ==========================================

export interface PrescriptionMedicineRequestDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sequenceNo: number;
}

export interface PrescriptionRequestDto {
  patientId: number;
  doctorId: number;
  prescriptionDate: string; // LocalDate
  diagnosis: string;
  symptoms: string;
  clinicalNotes: string;
  testsRecommended?: string;
  advice?: string;
  nextVisitDate?: string; // LocalDate
  status?: string;
  medicines: PrescriptionMedicineRequestDto[];
}

export interface PrescriptionMedicineResponseDto {
  id: number;
  prescriptionId: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sequenceNo: number;
}

export interface PrescriptionResponseDto {
  id: number;
  clinicId: number;
  prescriptionCode: string;
  patientId: number;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  prescriptionDate: string; // LocalDate
  diagnosis: string;
  symptoms: string;
  clinicalNotes: string;
  testsRecommended?: string;
  advice?: string;
  nextVisitDate?: string; // LocalDate
  status: string;
  pdfUrl?: string;
  medicines: PrescriptionMedicineResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export const prescriptionService = {
  createPrescription: async (clinicId: number = 1, request: PrescriptionRequestDto) => {
    const response = await apiClient.post<{ data: PrescriptionResponseDto }>(
      `/prescriptions?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getPrescriptionById: async (prescriptionId: number, clinicId: number = 1) => {
    const response = await apiClient.get<{ data: PrescriptionResponseDto }>(
      `/prescriptions/${prescriptionId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getPrescriptions: async (
    clinicId: number = 1,
    params: {
      patientId?: number;
      doctorId?: number;
      fromDate?: string; // LocalDate
      toDate?: string; // LocalDate
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    } = {}
  ) => {
    const response = await apiClient.get<{
      data: {
        content: PrescriptionResponseDto[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      };
    }>(`/prescriptions`, {
      params: {
        clinicId,
        patientId: params.patientId,
        doctor: params.doctorId,
        fromDate: params.fromDate,
        toDate: params.toDate,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'prescriptionDate',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return response.data.data;
  },

  previewPrescription: async (clinicId: number = 1, request: PrescriptionRequestDto) => {
    const response = await apiClient.post<{ data: PrescriptionResponseDto }>(
      `/prescriptions/preview?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  generatePdf: async (prescriptionId: number, clinicId: number = 1) => {
    const response = await apiClient.post<{ data: { pdfUrl: string } }>(
      `/prescriptions/${prescriptionId}/pdf?clinicId=${clinicId}`
    );
    return response.data.data;
  },
};

// ==========================================
// 5. DOCTOR DTOs & SERVICES (DoctorController)
// ==========================================

export interface DoctorResponseDto {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialization: string;
  qualification: string;
  experience: string;
  fee: string;
  followupFee: string;
  workingHours: string;
  isActive: boolean;
  registrationNumber: string;
  gender: string;
  languages: string;
  avatarUrl: string;
  completedConsultations?: number;
  totalCompletedConsultations?: number;
}

export const doctorService = {
  getDoctors: async (clinicId: number = 1) => {
    const response = await apiClient.get<{ data: DoctorResponseDto[] }>(
      `/doctors?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  createDoctor: async (clinicId: number = 1, doctor: Partial<DoctorResponseDto>) => {
    const response = await apiClient.post<{ data: DoctorResponseDto }>(
      `/doctors?clinicId=${clinicId}`,
      doctor
    );
    return response.data.data;
  },

  updateDoctor: async (doctorId: number, clinicId: number = 1, doctor: Partial<DoctorResponseDto>) => {
    const response = await apiClient.put<{ data: DoctorResponseDto }>(
      `/doctors/${doctorId}?clinicId=${clinicId}`,
      doctor
    );
    return response.data.data;
  }
};

// ==========================================
// 6. AUTHENTICATION SERVICES (AuthController)
// ==========================================

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      data: {
        token: string;
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }>('/auth/login', { email, password });
    return response.data.data;
  }
};

// ==========================================
// 7. USER MANAGEMENT SERVICES (UserController)
// ==========================================

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF';
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  followupFee?: string;
}

export const userService = {
  getUsers: async () => {
    const response = await apiClient.get<{ data: UserResponseDto[] }>('/users');
    return response.data.data;
  },
  createUser: async (user: Partial<UserResponseDto>) => {
    const response = await apiClient.post<{ data: UserResponseDto }>('/users', user);
    return response.data.data;
  },
  updateUser: async (id: string, user: Partial<UserResponseDto>) => {
    const response = await apiClient.put<{ data: UserResponseDto }>(`/users/${id}`, user);
    return response.data.data;
  },
  getPermissions: async () => {
    const response = await apiClient.get<{ data: any[] }>('/users/permissions');
    return response.data.data;
  },
  savePermissions: async (permissions: any[]) => {
    await apiClient.post('/users/permissions', permissions);
  }
};

// ==========================================
// 8. REPORT SERVICES (ReportController)
// ==========================================

export interface MonthlyRevenueItemDto {
  month: string;
  revenue: number;
  appointments: number;
}

export interface DoctorReportSummaryDto {
  id: string;
  name: string;
  initials: string;
  specialization: string;
  appointments: number;
  revenue: number;
  pending: number;
  completedConsultations: number;
  totalConsultations: number;
}

export interface ReportsDataDto {
  totalRevenue: number;
  revenueChangePercent: number;
  appointmentsCount: number;
  appointmentsChangePercent: number;
  pendingPayments: number;
  pendingChangePercent: number;
  monthlyRevenueTrend: MonthlyRevenueItemDto[];
  topDoctors: DoctorReportSummaryDto[];
}

export interface RecentAppointmentDto {
  id: string;
  patientName: string;
  initials: string;
  doctorName: string;
  time: string;
  status: string;
  statusText: string;
  statusVariant: 'success' | 'neutral' | 'danger' | 'info';
}

export interface PatientFlowItemDto {
  name: string;
  consultations: number;
  followUps: number;
}

export interface WeeklyRevenueItemDto {
  day: string;
  revenue: number;
}

export interface TimewiseAppointmentDto {
  time: string;
  count: number;
}

export interface DashboardDataDto {
  totalPatients: number;
  appointmentsTodayCount: number;
  pendingBilling: number;
  newReportsCount: number;
  recentAppointments: RecentAppointmentDto[];
  patientFlow: PatientFlowItemDto[];
  weeklyRevenue: WeeklyRevenueItemDto[];
  timewiseAppointments: TimewiseAppointmentDto[];
}

export const reportService = {
  getReportData: async (clinicId: number = 1, filters: { quickFilter: string; fromDate?: string; toDate?: string }) => {
    const response = await apiClient.get<{ data: ReportsDataDto }>('/reports', {
      params: {
        clinicId,
        quickFilter: filters.quickFilter,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      }
    });
    return response.data.data;
  },

  getDashboardData: async (clinicId: number = 1, params: { fromDate: string; toDate: string }) => {
    const response = await apiClient.get<{ data: DashboardDataDto }>('/reports/dashboard', {
      params: {
        clinicId,
        fromDate: params.fromDate,
        toDate: params.toDate,
      }
    });
    return response.data.data;
  }
};

export const clinicService = {
  getClinicSettings: async (id: number = 1) => {
    const response = await apiClient.get<{ data: any }>(`/clinics/${id}`);
    return response.data.data;
  },
  updateClinicSettings: async (id: number = 1, clinic: any) => {
    const response = await apiClient.put(`/clinics/${id}`, clinic);
    return response.data.data;
  },
  getBillingSettings: async (id: number = 1) => {
    const response = await apiClient.get<{ data: any }>(`/clinics/${id}/billing`);
    return response.data.data;
  },
  updateBillingSettings: async (id: number = 1, billing: any) => {
    const response = await apiClient.put(`/clinics/${id}/billing`, billing);
    return response.data.data;
  },
  getPrescriptionSettings: async (id: number = 1) => {
    const response = await apiClient.get<{ data: any }>(`/clinics/${id}/prescription`);
    return response.data.data;
  },
  updatePrescriptionSettings: async (id: number = 1, prescription: any) => {
    const response = await apiClient.put(`/clinics/${id}/prescription`, prescription);
    return response.data.data;
  }
};
