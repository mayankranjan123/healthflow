import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StaffUser } from '../types';

interface StaffFormProps {
  staff?: StaffUser | null;
  onSave: (staffData: Omit<StaffUser, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const StaffForm: React.FC<StaffFormProps> = ({ staff, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email);
      setMobile(staff.mobile);
      setAvatarUrl(staff.avatarUrl || '');
      setIsActive(staff.isActive);
      setGender(staff.gender || '');
      setDateOfBirth(staff.dateOfBirth || '');
    } else {
      setName('');
      setEmail('');
      setMobile('+91');
      setAvatarUrl('');
      setIsActive(true);
      setGender('');
      setDateOfBirth('');
    }
  }, [staff]);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation: size less than 1MB
    if (file.size >= 1024 * 1024) {
      setUploadError("File size must be less than 1MB");
      return;
    }

    // Frontend validation: must be PNG
    if (file.type !== "image/png") {
      setUploadError("Only PNG files are allowed");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const tokenCached = localStorage.getItem('healthflow_user');
      let headers = {};
      if (tokenCached) {
        const parsed = JSON.parse(tokenCached);
        if (parsed && parsed.token) {
          headers["Authorization"] = "Bearer " + parsed.token;
        }
      }

      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: headers,
        body: formDataUpload
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAvatarUrl(result.data.url);
      } else {
        setUploadError(result.message || "Failed to upload photo");
      }
    } catch (err) {
      setUploadError("Upload error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    // Reset Custom Validities
    const emailInput = form.querySelector('#staff-email') as HTMLInputElement;
    const mobileInput = form.querySelector('#staff-mobile') as HTMLInputElement;
    const dobInput = form.querySelector('#staff-dob') as HTMLInputElement;

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
      id: staff?.id,
      name,
      email,
      mobile,
      avatarUrl: avatarUrl || undefined,
      isActive,
      gender,
      dateOfBirth,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Uploader */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Photo</label>
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 font-bold text-xl uppercase">
                {name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'ST'}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">PNG only. Max 1MB.</p>
        {uploadError && (
          <p className="text-rose-600 text-[10px] font-bold mt-1 text-center animate-pulse">
            {uploadError}
          </p>
        )}
        {isUploading && (
          <p className="text-blue-600 text-[10px] font-bold mt-1 text-center animate-pulse">
            Uploading photo...
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Staff Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Sarah Jenkins"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            id="staff-mobile"
            value={mobile}
            onChange={(e) => { setMobile(e.target.value); e.target.setCustomValidity(''); }}
            required
            placeholder="e.g. +91 98765 00001"
          />
          <Input
            label="Email Address"
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); e.target.setCustomValidity(''); }}
            required
            placeholder="e.g. staff@healthflow.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            id="staff-dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => { setDateOfBirth(e.target.value); e.target.setCustomValidity(''); }}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="staff-status"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="staff-status" className="text-sm text-slate-700 font-semibold cursor-pointer">
            Authorized Account Active State
          </label>
        </div>
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
