import axios from 'axios';

// Resolve API base URL based on environment context
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export const DEFAULT_CLINIC_ID = 1000000000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Promise cache map to deduplicate concurrent GET requests (e.g. StrictMode mount spikes)
const inflightRequests = new Map<string, Promise<any>>();
const originalGet = apiClient.get.bind(apiClient);

apiClient.get = function <T = any, R = any, D = any>(
  url: string,
  config?: any
): Promise<R> {
  const key = `get:${url}:${config?.params ? JSON.stringify(config.params) : ''}`;
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key) as Promise<R>;
  }

  const promise = originalGet(url, config).then(
    (response) => {
      inflightRequests.delete(key);
      return response;
    },
    (error) => {
      inflightRequests.delete(key);
      throw error;
    }
  );

  inflightRequests.set(key, promise);
  return promise as Promise<R>;
} as any;

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

export interface PatientFile {
  id: number | string;
  patientId: number | string;
  fileName: string;
  uploadedDate: string; // YYYY-MM-DD
  category: string;
  size: string;
  fileType: string;
}

export interface MobileCheckResultDto {
  duplicate: boolean;
  message: string;
  existingPatientId?: number | string;
}

export const patientService = {
  createPatient: async (clinicId: number = DEFAULT_CLINIC_ID, request: PatientRequestDto) => {
    const response = await apiClient.post<{ data: PatientResponseDto }>(
      `/patients?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  updatePatient: async (patientId: number | string, clinicId: number = DEFAULT_CLINIC_ID, request: PatientRequestDto) => {
    const response = await apiClient.put<{ data: PatientResponseDto }>(
      `/patients/${patientId}?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getPatientById: async (patientId: number | string, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: PatientResponseDto }>(
      `/patients/${patientId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getPatients: async (
    clinicId: number = DEFAULT_CLINIC_ID,
    params: {
      patientId?: string;
      patientMobile?: string;
      patientName?: string;
      gender?: string;
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
        patientId: params.patientId,
        patientMobile: params.patientMobile,
        patientName: params.patientName,
        gender: params.gender,
        page: params.page ?? 0,
        size: params.size ?? 5,
        sortBy: params.sortBy ?? 'id',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return response.data.data;
  },

  getFiles: async (
    patientId: number | string,
    params: {
      fileName?: string;
      page?: number;
      size?: number;
    } = {}
  ) => {
    const response = await apiClient.post<{
      data: {
        content: PatientFile[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      };
    }>(`/patients/${patientId}/files/search`, {
      fileName: params.fileName
    }, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 5,
      }
    });
    return response.data.data;
  },

  uploadFile: async (
    patientId: number | string,
    file: Omit<PatientFile, 'id' | 'patientId'>
  ) => {
    const response = await apiClient.post<{ data: PatientFile }>(
      `/patients/${patientId}/files`,
      file
    );
    return response.data.data;
  },

  deleteFile: async (
    patientId: number | string,
    fileId: number | string
  ) => {
    const response = await apiClient.delete<{ message: string }>(
      `/patients/${patientId}/files/${fileId}`
    );
    return response.data;
  },

  checkMobileDuplicate: async (mobile: string, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: MobileCheckResultDto }>(
      `/patients/check-mobile`,
      {
        params: { mobile, clinicId },
      }
    );
    return response.data.data;
  },

  deletePatient: async (patientId: number, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.delete<{ message: string }>(
      `/patients/${patientId}?clinicId=${clinicId}`
    );
    return response.data;
  },

  updateStatus: async (patientId: number, status: string, clinicId: number = DEFAULT_CLINIC_ID) => {
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
  createAppointment: async (clinicId: number = DEFAULT_CLINIC_ID, request: AppointmentRequestDto) => {
    const response = await apiClient.post<{ data: AppointmentResponseDto }>(
      `/appointments?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getAppointmentById: async (appointmentId: number | string, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: AppointmentResponseDto }>(
      `/appointments/${appointmentId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getAppointments: async (
    clinicId: number = DEFAULT_CLINIC_ID,
    params: {
      doctorName?: string;
      status?: string;
      fromDate?: string; // Instant ISO
      toDate?: string; // Instant ISO
      patientName?: string;
      patientMobile?: string;
      visitType?: string;
      patientId?: number | string;
      doctorId?: number | string;
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
        doctorName: params.doctorName,
        status: params.status,
        fromDate: params.fromDate,
        toDate: params.toDate,
        patientName: params.patientName,
        patientMobile: params.patientMobile,
        visitType: params.visitType,
        patientId: params.patientId,
        doctorId: params.doctorId,
        page: params.page ?? 0,
        size: params.size ?? 5,
        sortBy: params.sortBy ?? 'appointmentDateTime',
        sortDir: params.sortDir ?? 'asc',
      },
    });
    return response.data.data;
  },

  updateAppointment: async (
    appointmentId: number | string,
    clinicId: number = DEFAULT_CLINIC_ID,
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
    clinicId: number = DEFAULT_CLINIC_ID,
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
    clinicId: number = DEFAULT_CLINIC_ID
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
  createInvoice: async (clinicId: number = DEFAULT_CLINIC_ID, request: InvoiceRequestDto) => {
    const response = await apiClient.post<{ data: InvoiceResponseDto }>(
      `/invoices?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getInvoiceById: async (invoiceId: number | string, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: InvoiceResponseDto }>(
      `/invoices/${invoiceId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getInvoices: async (
    clinicId: number = DEFAULT_CLINIC_ID,
    params: {
      patientSearch?: string;
      fromDate?: string; // LocalDate
      toDate?: string; // LocalDate
      status?: string;
      doctorName?: string;
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
        patientSearch: params.patientSearch,
        fromDate: params.fromDate,
        toDate: params.toDate,
        status: params.status,
        doctorName: params.doctorName,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'id',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return response.data.data;
  },

  getStats: async (clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: InvoiceStatsDto }>(
      `/invoices/stats`,
      {
        params: { clinicId },
      }
    );
    return response.data.data;
  },

  previewInvoice: async (clinicId: number = DEFAULT_CLINIC_ID, request: InvoiceRequestDto) => {
    const response = await apiClient.post<{ data: InvoiceResponseDto }>(
      `/invoices/preview?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  generatePdf: async (invoiceId: number, clinicId: number = DEFAULT_CLINIC_ID) => {
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
  headerLayout?: string;
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
  headerLayout?: string;
  medicines: PrescriptionMedicineResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export const prescriptionService = {
  createPrescription: async (clinicId: number = DEFAULT_CLINIC_ID, request: PrescriptionRequestDto) => {
    const response = await apiClient.post<{ data: PrescriptionResponseDto }>(
      `/prescriptions?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  getPrescriptionById: async (prescriptionId: number, clinicId: number = DEFAULT_CLINIC_ID) => {
    const response = await apiClient.get<{ data: PrescriptionResponseDto }>(
      `/prescriptions/${prescriptionId}?clinicId=${clinicId}`
    );
    return response.data.data;
  },

  getPrescriptions: async (
    clinicId: number = DEFAULT_CLINIC_ID,
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

  previewPrescription: async (clinicId: number = DEFAULT_CLINIC_ID, request: PrescriptionRequestDto) => {
    const response = await apiClient.post<{ data: PrescriptionResponseDto }>(
      `/prescriptions/preview?clinicId=${clinicId}`,
      request
    );
    return response.data.data;
  },

  generatePdf: async (prescriptionId: number, clinicId: number = DEFAULT_CLINIC_ID) => {
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
  getDoctors: async (clinicId: number = DEFAULT_CLINIC_ID, params?: { pageNo?: number; pageSize?: number; searchPrefix?: string; specialization?: string; status?: string }) => {
    const response = await apiClient.get<{
      data: {
        content: DoctorResponseDto[];
        totalPages: number;
        totalElements: string | number;
        size: number;
        numberOfElements: number;
      };
    }>(`/doctors?clinicId=${clinicId}`, { params });
    
    const pageData = response.data.data;
    const dataList = pageData?.content || [];
    const totalItems = Number(pageData?.totalElements || 0);
    const pageSize = Number(pageData?.size || params?.pageSize || 10);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data: dataList,
      pageNo: Number(params?.pageNo || 0),
      pageSize: pageSize,
      totalItems: totalItems,
      totalPages: totalPages,
    };
  },

  createDoctor: async (clinicId: number = DEFAULT_CLINIC_ID, doctor: Partial<DoctorResponseDto>) => {
    const response = await apiClient.post<{ data: DoctorResponseDto }>(
      `/doctors?clinicId=${clinicId}`,
      doctor
    );
    return response.data.data;
  },

  updateDoctor: async (doctorId: number, clinicId: number = DEFAULT_CLINIC_ID, doctor: Partial<DoctorResponseDto>) => {
    const response = await apiClient.put<{ data: DoctorResponseDto }>(
      `/doctors/${doctorId}?clinicId=${clinicId}`,
      doctor
    );
    return response.data.data;
  },

  getDoctorByEmail: async (email: string) => {
    const response = await apiClient.get<{ data: DoctorResponseDto }>(
      `/doctors/email/${email}`
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
  setPasswordLink?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  fee?: string;
  workingHours?: string;
  registrationNumber?: string;
  totalConsultations?: string;
  joiningDate?: string;
}

export const userService = {
  getUsers: async (params?: { pageNo?: number; pageSize?: number; status?: string; user_name?: string; user_email?: string; user_role?: string }) => {
    const response = await apiClient.get<{
      data: {
        content: UserResponseDto[];
        totalPages: number;
        totalElements: string | number;
        size: number;
        numberOfElements: number;
      };
    }>('/users', { params });
    
    const pageData = response.data.data;
    const dataList = pageData?.content || [];
    const totalItems = Number(pageData?.totalElements || 0);
    const pageSize = Number(pageData?.size || params?.pageSize || 5);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data: dataList,
      pageNo: Number(params?.pageNo || 0),
      pageSize: pageSize,
      totalItems: totalItems,
      totalPages: totalPages,
    };
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
  getReportData: async (clinicId: number = DEFAULT_CLINIC_ID, filters: { quickFilter: string; fromDate?: string; toDate?: string }) => {
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

  getDashboardData: async (clinicId: number = DEFAULT_CLINIC_ID, params: { fromDate: string; toDate: string }) => {
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
