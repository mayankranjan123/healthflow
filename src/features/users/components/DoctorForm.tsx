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
  const [fee, setFee] = useState<number>(100);
  const [followupFee, setFollowupFee] = useState<number>(60);
  const [workingHours, setWorkingHours] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gender, setGender] = useState('Female');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    if (doctor) {
      setName(doctor.name);
      setEmail(doctor.email);
      setMobile(doctor.mobile);
      setSpecialization(doctor.specialization);
      setQualification(doctor.qualification);
      setExperience(doctor.experience);
      setFee(doctor.fee);
      setFollowupFee(doctor.followupFee || 60);
      setWorkingHours(doctor.workingHours);
      setIsActive(doctor.isActive);
      setRegistrationNumber(doctor.registrationNumber);
      setJoiningDate(doctor.joiningDate);
      setAvatarUrl(doctor.avatarUrl || '');
      setGender(doctor.gender || 'Female');
      setDateOfBirth(doctor.dateOfBirth || '');
    } else {
      setName('');
      setEmail('');
      setMobile('+91');
      setSpecialization('General Physician');
      setQualification('');
      setExperience('');
      setFee(100);
      setFollowupFee(60);
      setWorkingHours('09:00 AM - 05:00 PM');
      setIsActive(true);
      setRegistrationNumber('');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl('');
      setGender('Female');
      setDateOfBirth('');
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
    const form = e.currentTarget as HTMLFormElement;

    // Reset Custom Validities
    const emailInput = form.querySelector('#doctor-email') as HTMLInputElement;
    const mobileInput = form.querySelector('#doctor-mobile') as HTMLInputElement;
    const dobInput = form.querySelector('#doctor-dob') as HTMLInputElement;

    if (emailInput) emailInput.setCustomValidity('');
    if (mobileInput) mobileInput.setCustomValidity('');
    if (dobInput) dobInput.setCustomValidity('');

    // 1. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (emailInput) {
        emailInput.setCustomValidity("Please enter a valid email address.");
        emailInput.reportValidity();
      }
      return;
    }

    // 2. Indian mobile validation
    const cleanedMobile = mobile.replace(/[\s\-()]/g, '');
    const mobileRegex = /^(?:\+?91)?[6789]\d{9}$/;
    if (!mobileRegex.test(cleanedMobile)) {
      if (mobileInput) {
        mobileInput.setCustomValidity("Please enter a valid 10-digit mobile number.");
        mobileInput.reportValidity();
      }
      return;
    }

    // 3. DOB validation (older than 18, younger than 100)
    if (!dateOfBirth) {
      if (dobInput) {
        dobInput.setCustomValidity("Date of birth is required.");
        dobInput.reportValidity();
      }
      return;
    }
    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18 || age > 100) {
      if (dobInput) {
        dobInput.setCustomValidity("Age must be between 18 and 100 years.");
        dobInput.reportValidity();
      }
      return;
    }

    onSave({
      id: doctor?.id,
      name,
      email,
      mobile,
      specialization,
      qualification,
      experience,
      fee: Number(fee),
      followupFee: Number(followupFee),
      workingHours,
      isActive,
      registrationNumber,
      totalConsultations: 0,
      joiningDate,
      avatarUrl: avatarUrl || undefined,
      gender,
      dateOfBirth,
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
          label="Consultation Fee (₹)"
          type="number"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          required
          min={0}
        />

        <Input
          label="Follow-up Fee (₹)"
          type="number"
          value={followupFee}
          onChange={(e) => setFollowupFee(Number(e.target.value))}
          required
          min={0}
        />

        <div className="space-y-1.5 flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50/50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[42px]"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input
          label="Date of Birth"
          id="doctor-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => { setDateOfBirth(e.target.value); e.target.setCustomValidity(''); }}
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
          label="Joining Date"
          type="date"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
          required
        />

        <Input
          label="Contact Mobile"
          id="doctor-mobile"
          value={mobile}
          onChange={(e) => { setMobile(e.target.value); e.target.setCustomValidity(''); }}
          required
          placeholder="e.g. +91 98765 00001"
        />

        <div className="md:col-span-2">
          <Input
            label="Contact Email"
            id="doctor-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); e.target.setCustomValidity(''); }}
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
