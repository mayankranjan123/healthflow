import React from 'react';
import { X, Calendar, Printer, Info, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ExtendedAppointment } from '../types';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ExtendedAppointment | null;
  onCancelClick: (appt: ExtendedAppointment) => void;
  onCompleteClick: (appt: ExtendedAppointment) => void;
  onPrintClick?: (appt: ExtendedAppointment) => void;
}

export const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCancelClick,
  onCompleteClick,
  onPrintClick,
}) => {
  if (!appointment) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Scheduled',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const statusStyle = getStatusStyle(appointment.status);

  // Parse appointment date nicely
  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    if (onPrintClick) {
      onPrintClick(appointment);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Appointment Slip - ${appointment.appointmentCode || appointment.id}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .slip-card {
              max-width: 480px;
              margin: 0 auto;
              border: 2px dashed #cbd5e1;
              padding: 30px;
              border-radius: 16px;
              background-color: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 4px;
            }
            .token-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 20px;
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .token-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            .token-number {
              font-size: 20px;
              font-weight: 800;
              color: #4f46e5;
            }
            .section-title {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 1.5px;
              margin-bottom: 8px;
            }
            .field-group {
              margin-bottom: 18px;
            }
            .field-value {
              font-size: 14px;
              font-weight: 600;
              color: #334155;
            }
            .field-desc {
              font-size: 12px;
              color: #64748b;
              margin-top: 2px;
            }
            .footer {
              text-align: center;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              margin-top: 24px;
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
            }
            @media print {
              body { margin: 0; }
              .slip-card { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header">
              <div class="logo">HealthFlow</div>
              <div class="subtitle">Appointment Confirmation Slip</div>
            </div>
            
            <div class="token-container">
              <span class="token-label">Queue Token</span>
              <span class="token-number">${appointment.tokenNumber || '#42'}</span>
            </div>

            <div class="field-group">
              <div class="section-title">Patient Details</div>
              <div class="field-value">${appointment.patientName}</div>
              <div class="field-desc">ID: ${appointment.patientId} • Phone: ${appointment.patientPhone}</div>
            </div>

            <div class="field-group">
              <div class="section-title">Schedule</div>
              <div class="field-value">${formattedDate}</div>
              <div class="field-desc">Preferred Time Slot: ${appointment.appointmentTime} (${appointment.visitType || 'In-person Visit'})</div>
            </div>

            <div class="field-group">
              <div class="section-title">Assigned Physician</div>
              <div class="field-value">${appointment.doctorName}</div>
              <div class="field-desc">${appointment.doctorSpecialization}</div>
            </div>

            <div class="field-group">
              <div class="section-title">Consultation Reason</div>
              <div class="field-value" style="font-weight: 500; line-height: 1.4;">${appointment.reason}</div>
            </div>

            <div class="footer">
              Please present this confirmation slip at the reception desk.<br>
              Thank you for choosing HealthFlow.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-slate-800">
          <Calendar className="w-5 h-5 text-brand-primary" />
          <span className="font-display font-semibold text-lg">Appointment Details</span>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Date, Time & Status banner */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-800">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-sm">
              {formattedDate} <span className="text-slate-300 font-normal mx-1.5">•</span> {appointment.appointmentTime}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            <span>{statusStyle.label}</span>
          </div>
        </div>

        {/* Assigned Physician Details */}
        <div className="flex items-start gap-4 p-1">
          <img
            src={appointment.doctorAvatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop'}
            alt={appointment.doctorName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border border-slate-200/80 bg-slate-50"
          />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Assigned Physician
            </span>
            <h4 className="text-lg font-bold text-slate-800 font-display">
              {appointment.doctorName}
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              {appointment.doctorSpecialization} • Specialist Clinic
            </p>
          </div>
        </div>

        {/* Appointment Reason styled callout banner */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
            Appointment Reason
          </span>
          <div className="bg-indigo-50/50 border-l-[3.5px] border-indigo-500 rounded-r-xl p-4">
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {appointment.reason}
            </p>
          </div>
        </div>

        {/* Clinical Notes (if available) */}
        {appointment.notes && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              Clinical Notes
            </span>
            <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3.5">
              <p className="text-xs font-medium text-amber-900/80 leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          </div>
        )}

        {/* Grid info parameters */}
        <div className="grid grid-cols-2 gap-3">
          {/* Visit Type */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Visit Type
            </span>
            <span className="text-sm font-bold text-slate-700">
              {appointment.visitType || 'In-person Visit'}
            </span>
          </div>

          {/* Token Number */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Token Number
            </span>
            <span className="text-sm font-bold text-brand-primary">
              {appointment.tokenNumber || '#42'}
            </span>
          </div>

          {/* Created By */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Created By
            </span>
            <span className="text-sm font-bold text-slate-700">
              {appointment.createdBy || 'Sarah Mitchell'}
            </span>
          </div>

          {/* Last Updated */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Last Updated
            </span>
            <span className="text-sm font-bold text-slate-700">
              {appointment.lastUpdated || 'Oct 26, 09:14 AM'}
            </span>
          </div>
        </div>

        {/* Patient Contact Info */}
        <div className="border border-slate-100 shadow-sm rounded-xl p-4 bg-white space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Patient Contact & ID
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold text-slate-800">{appointment.patientName}</span>{' '}
              <span className="text-xs text-slate-400 font-semibold font-mono">({appointment.patientId})</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 font-mono">
              Phone: {appointment.patientPhone}
            </div>
          </div>
        </div>

        {/* Info advice footer box */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-slate-500 leading-normal">
            Patient is requested to arrive 15 minutes early with current medications and previous test reports.
          </p>
        </div>

        {/* Footnote cancel, print, and close button triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div>
            {appointment.status === 'SCHEDULED' && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCancelClick(appointment)}
                  className="w-full sm:w-auto border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-semibold text-sm px-4 h-11 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => onCompleteClick(appointment)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 h-11 rounded-lg transition-colors cursor-pointer border-0 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-4 h-11 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-brand-primary hover:bg-indigo-700 text-white font-semibold text-sm px-5 h-11 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
