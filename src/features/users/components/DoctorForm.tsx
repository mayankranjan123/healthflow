import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DoctorUser } from '../types';

interface DoctorFormProps {
  doctor?: DoctorUser | null;
  onSave: (doctorData: Omit<DoctorUser, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const SPECIALIZATION_OPTIONS = [
  { value: 'Cardiologist', label: 'Cardiologist' },
  { value: 'General Physician', label: 'General Physician' },
  { value: 'Dermatologist', label: 'Dermatologist' },
  { value: 'Pediatrician', label: 'Pediatrician' },
  { value: 'Neurologist', label: 'Neurologist' },
  { value: 'Orthopedic', label: 'Orthopedic Surgeon' },
  { value: 'Gynecologist', label: 'Gynecologist' },
];

export const DoctorForm: React.FC<DoctorFormProps> = ({ doctor, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState<number>(60);
  const [workingHours, setWorkingHours] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [totalConsultations, setTotalConsultations] = useState<number>(0);
  const [joiningDate, setJoiningDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (doctor) {
      setName(doctor.name);
      setEmail(doctor.email);
      setMobile(doctor.mobile);
      setSpecialization(doctor.specialization);
      setQualification(doctor.qualification);
      setExperience(doctor.experience);
      setFee(doctor.fee);
      setWorkingHours(doctor.workingHours);
      setIsActive(doctor.isActive);
      setRegistrationNumber(doctor.registrationNumber);
      setTotalConsultations(doctor.totalConsultations);
      setJoiningDate(doctor.joiningDate);
      setAvatarUrl(doctor.avatarUrl || '');
    } else {
      setName('');
      setEmail('');
      setMobile('');
      setSpecialization('General Physician');
      setQualification('');
      setExperience('');
      setFee(60);
      setWorkingHours('09:00 AM - 05:00 PM');
      setIsActive(true);
      setRegistrationNumber('');
      setTotalConsultations(0);
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl('');
    }
  }, [doctor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: doctor?.id,
      name,
      email,
      mobile,
      specialization,
      qualification,
      experience,
      fee: Number(fee),
      workingHours,
      isActive,
      registrationNumber,
      totalConsultations: Number(totalConsultations),
      joiningDate,
      avatarUrl: avatarUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Uploader */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor Photo</label>
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 font-bold text-xl uppercase">
                {name ? name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2) : 'DR'}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">PNG, JPG or GIF. Max 2MB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Doctor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Dr. Aisha Mehta"
        />

        <Select
          label="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          options={SPECIALIZATION_OPTIONS}
        />

        <Input
          label="Qualification"
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          required
          placeholder="e.g. MBBS, MD, DM"
        />

        <Input
          label="Experience (e.g. '12 yrs')"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
          placeholder="e.g. 12 yrs"
        />

        <Input
          label="Consultation Fee ($)"
          type="number"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          required
          min={0}
        />

        <Input
          label="Working Hours"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
          required
          placeholder="e.g. 09:00 AM - 04:00 PM"
        />

        <Input
          label="Medical Registration Number"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          required
          placeholder="e.g. REG-87421"
        />

        <Input
          label="Total Consultations"
          type="number"
          value={totalConsultations}
          onChange={(e) => setTotalConsultations(Number(e.target.value))}
          required
          min={0}
        />

        <Input
          label="Joining Date"
          type="date"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
          required
        />

        <Input
          label="Contact Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          placeholder="e.g. +1 (555) 099-1122"
        />

        <div className="md:col-span-2">
          <Input
            label="Contact Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. doctor@healthflow.com"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          id="doctor-status"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="doctor-status" className="text-sm text-slate-700 font-semibold cursor-pointer">
          Doctor Status Active & Available
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>
    </form>
  );
};
