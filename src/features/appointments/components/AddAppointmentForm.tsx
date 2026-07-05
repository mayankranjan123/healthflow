import React, { useState, useEffect } from 'react';
import { Plus, User, Stethoscope, Clock, Calendar, CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { ExtendedAppointment } from '../types';
import { mockPatientsApi } from '../../patients/utils/mockPatientsApi';
import { mockDoctorsApi } from '../../doctors/utils/mockDoctorsApi';
import { mockAppointmentsApi } from '../utils/mockAppointmentsApi';
import { PatientProfileExtended } from '../../patients/types';
import { DoctorProfileExtended } from '../../doctors/types';
import { AppointmentStatus } from '../../../types';

interface AddAppointmentFormProps {
  onSubmit: (data: Omit<ExtendedAppointment, 'id' | 'patientId' | 'doctorId'> & { patientId?: string; doctorId?: string }) => void;
  onCancel: () => void;
}

export const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [patients, setPatients] = useState<PatientProfileExtended[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfileExtended[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<ExtendedAppointment[]>([]);

  // Toggle for existing vs new patient
  const [isNewPatient, setIsNewPatient] = useState<boolean>(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [newPatientFirstName, setNewPatientFirstName] = useState<string>('');
  const [newPatientLastName, setNewPatientLastName] = useState<string>('');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [newPatientGender, setNewPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:30 AM');
  const [status, setStatus] = useState<AppointmentStatus>('SCHEDULED');
  const [reason, setReason] = useState<string>('');
  const [visitType, setVisitType] = useState<string>('In-person Visit');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load existing patients, doctors & appointments
    Promise.all([
      mockPatientsApi.getPatients(),
      mockDoctorsApi.getDoctors(),
      mockAppointmentsApi.getAppointments()
    ]).then(([fetchedPatients, fetchedDoctors, fetchedAppointments]) => {
      setPatients(fetchedPatients);
      setDoctors(fetchedDoctors); // show all doctors
      setExistingAppointments(fetchedAppointments);

      if (fetchedPatients.length > 0) {
        setSelectedPatientId(fetchedPatients[0].id);
      }
      if (fetchedDoctors.length > 0) {
        setSelectedDoctorId(fetchedDoctors[0].id);
      }
    });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (isNewPatient) {
      if (!newPatientFirstName.trim()) newErrors.newPatientFirstName = 'First name is required';
      if (!newPatientLastName.trim()) newErrors.newPatientLastName = 'Last name is required';
      if (!newPatientPhone.trim()) newErrors.newPatientPhone = 'Phone number is required';
    } else {
      if (!selectedPatientId) newErrors.selectedPatientId = 'Please select a patient';
    }

    if (!selectedDoctorId) newErrors.selectedDoctorId = 'Please select a physician';
    if (!appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!reason.trim()) newErrors.reason = 'Reason for visit is required';

    // Double booking check for same doctor during same date and time slot
    if (selectedDoctorId && appointmentDate && appointmentTime) {
      const isConflict = existingAppointments.some(a =>
        a.doctorId === selectedDoctorId &&
        a.appointmentDate === appointmentDate &&
        a.appointmentTime === appointmentTime &&
        a.status !== 'CANCELLED'
      );
      if (isConflict) {
        newErrors.appointmentTime = 'Slot full for this time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let patientName = '';
    let patientNumber = '';
    let patientPhone = '';
    let patientGender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';
    let patientId = selectedPatientId;

    if (isNewPatient) {
      // Register new patient locally in mock store
      const newPatient: PatientProfileExtended = {
        id: '',
        patientNumber: '',
        firstName: newPatientFirstName.trim(),
        lastName: newPatientLastName.trim(),
        dateOfBirth: '1995-01-01', // placeholder
        gender: newPatientGender,
        phone: newPatientPhone.trim(),
        email: `${newPatientFirstName.toLowerCase()}.${newPatientLastName.toLowerCase()}@example.com`,
        address: 'No Address Provided',
        emergencyContactName: 'None Specified',
        emergencyContactPhone: '',
        allergies: 'None Reported',
        existingDiseases: 'None Reported',
        clinicalNotes: 'Registered during appointment creation.',
        bloodGroup: 'Unknown',
        purpose: 'New Appointment',
        lastVisit: 'None',
        nextVisit: 'None',
        attachments: [],
        appointments: [],
        prescriptions: []
      };
      const createdPatient = await mockPatientsApi.addPatient(newPatient);

      patientId = createdPatient.id;
      patientName = `${createdPatient.firstName} ${createdPatient.lastName}`;
      patientNumber = createdPatient.patientNumber;
      patientPhone = createdPatient.phone;
      patientGender = createdPatient.gender;
    } else {
      const match = patients.find(p => p.id === selectedPatientId);
      if (match) {
        patientName = `${match.firstName} ${match.lastName}`;
        patientNumber = match.patientNumber || match.id;
        patientPhone = match.phone;
        patientGender = match.gender;
      }
    }

    const doctorMatch = doctors.find(d => d.id === selectedDoctorId);
    const doctorName = doctorMatch ? doctorMatch.name : 'Dr. General Practitioner';
    const doctorSpecialization = doctorMatch ? doctorMatch.specialization : 'General';
    const doctorAvatarUrl = doctorMatch?.avatarUrl;

    onSubmit({
      patientId,
      patientName,
      patientNumber,
      patientPhone,
      patientGender,
      doctorId: selectedDoctorId,
      doctorName,
      doctorSpecialization,
      doctorAvatarUrl,
      appointmentDate,
      appointmentTime,
      status,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      visitType,
      tokenNumber: '#' + Math.floor(10 + Math.random() * 89),
      createdBy: 'Sarah Mitchell',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${appointmentTime}`
    });
  };

  const timeOptions = [
    { value: '09:00 AM', label: '09:00 AM' },
    { value: '09:30 AM', label: '09:30 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '10:30 AM', label: '10:30 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '11:30 AM', label: '11:30 AM' },
    { value: '12:00 PM', label: '12:00 PM' },
    { value: '01:00 PM', label: '01:00 PM' },
    { value: '01:30 PM', label: '01:30 PM' },
    { value: '02:00 PM', label: '02:00 PM' },
    { value: '02:30 PM', label: '02:30 PM' },
    { value: '03:00 PM', label: '03:00 PM' },
    { value: '03:30 PM', label: '03:30 PM' },
    { value: '04:00 PM', label: '04:00 PM' },
    { value: '04:30 PM', label: '04:30 PM' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Section Header & Toggle */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-primary" />
            <span>Patient Selection</span>
          </h4>
          {/* <button
            type="button"
            onClick={() => setIsNewPatient(!isNewPatient)}
            className="text-xs font-bold text-brand-primary hover:text-indigo-700 flex items-center gap-1 cursor-pointer outline-none transition-all"
          >
            {isNewPatient ? (
              <span>Select Existing Patient</span>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Patient</span>
              </>
            )}
          </button> */}
        </div>

        {isNewPatient ? (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={newPatientFirstName}
                onChange={(e) => setNewPatientFirstName(e.target.value)}
                error={errors.newPatientFirstName}
                required
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={newPatientLastName}
                onChange={(e) => setNewPatientLastName(e.target.value)}
                error={errors.newPatientLastName}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Mobile Phone"
                placeholder="+91 99999-99999"
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
                error={errors.newPatientPhone}
                required
              />
              <Select
                label="Gender"
                value={newPatientGender}
                onChange={(e) => setNewPatientGender(e.target.value as any)}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <Select
              label="Select Patient Profile"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              error={errors.selectedPatientId}
              options={patients.map(p => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName} (${p.id} • ${p.phone})`
              }))}
            />
          </div>
        )}
      </div>

      {/* Appointment Information */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Stethoscope className="w-4 h-4 text-brand-primary" />
          <span>Clinician & Scheduling</span>
        </h4>

        {/* Doctor Selection */}
        <Select
          label="Assigned Physician"
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          error={errors.selectedDoctorId}
          options={doctors.map(d => ({
            value: d.id,
            label: `${d.name} (${d.specialization})`
          }))}
        />

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label="Appointment Date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            error={errors.appointmentDate}
            required
          />
          <Select
            label="Preferred Time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            error={errors.appointmentTime}
            options={timeOptions}
          />
        </div>

        {/* Visit Type & Status */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Visit Type"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
            options={[
              { value: 'In-person Visit', label: 'In-person Visit' },
              { value: 'Teleconsultation', label: 'Teleconsultation' },
              { value: 'Follow-up', label: 'Follow-up' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            options={[
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <span>Consultation Context</span>
        </h4>

        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reason for Visit *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hypertension management follow-up or routine diabetes checkup"
              className={`w-full p-3 text-sm rounded-lg border bg-white focus:outline-none transition-all duration-200 min-h-[80px] text-slate-950 resize-y ${errors.reason ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                }`}
            />
            {errors.reason && <p className="text-xs text-rose-600 font-medium">{errors.reason}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Clinical Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific advice, clinical requirements or instructions..."
              className="w-full p-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200 min-h-[80px] text-slate-950 resize-y"
            />
          </div>
        </div>
      </div>

      {/* Drawer Action buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full bg-[#0f6c58] hover:bg-[#0c5948] text-white font-semibold rounded-lg text-sm h-11 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Book Appointment</span>
        </Button>
      </div>
    </form>
  );
};
