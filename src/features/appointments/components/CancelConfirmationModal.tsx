import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ExtendedAppointment } from '../types';

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ExtendedAppointment | null;
  onConfirm: () => void;
}

export const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirm,
}) => {
  if (!appointment) return null;

  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-display font-semibold text-lg">Cancel Appointment</span>
        </div>
      }
    >
      <div className="space-y-5 pt-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Are you sure you want to cancel the scheduled appointment{' '}
            <strong className="text-slate-900 font-semibold">{appointment.id}</strong>?
          </p>

          {/* Appointment brief box */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">PATIENT:</span>
              <span className="font-bold text-slate-800">{appointment.patientName} ({appointment.patientId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PHYSICIAN:</span>
              <span className="font-bold text-slate-800">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DATE & TIME:</span>
              <span className="font-bold text-slate-800">{formattedDate} • {appointment.appointmentTime}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            This action will update the status of this appointment to <strong className="text-rose-500 font-semibold">Cancelled</strong>. The patient will be notified of this change.
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-4 h-10 rounded-lg transition-colors cursor-pointer"
          >
            Keep Appointment
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-4 h-10 rounded-lg transition-colors cursor-pointer"
          >
            Cancel Appointment
          </Button>
        </div>
      </div>
    </Modal>
  );
};
