import React, { useState, useEffect } from 'react';
import { Camera, Save, X, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AdminUser } from '../types';

interface AdminFormProps {
  admin?: AdminUser | null;
  onSave: (adminData: Omit<AdminUser, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const AdminForm: React.FC<AdminFormProps> = ({ admin, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
      setMobile(admin.mobile);
      setAvatarUrl(admin.avatarUrl || '');
      setIsActive(admin.isActive);
      setGender(admin.gender || '');
      setDateOfBirth(admin.dateOfBirth || '');
    } else {
      setName('');
      setEmail('');
      setMobile('+91');
      setAvatarUrl('');
      setIsActive(true);
      setGender('');
      setDateOfBirth('');
    }
  }, [admin]);

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
    const emailInput = form.querySelector('#admin-email') as HTMLInputElement;
    const mobileInput = form.querySelector('#admin-mobile') as HTMLInputElement;
    const dobInput = form.querySelector('#admin-dob') as HTMLInputElement;

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
      id: admin?.id,
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
      <div className="flex flex-col items-center gap-2 pb-1.5">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 font-extrabold text-xl uppercase tracking-wider font-display">
                {name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'AD'}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-[#0c66e4] hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <div className="text-center mt-1">
          <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">PROFILE PHOTO</span>
          <span className="block text-[10px] text-slate-400 font-bold mt-1.5 leading-none">PNG only. Max 1MB.</span>
        </div>
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

      <div className="space-y-5">
        <Input
          label="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Dr. Robert Sterling"
          className="rounded-xl h-11"
        />

        {/* Mobile Input with country selector prefix */}
        <div className="space-y-1.5 w-full">
          <label htmlFor="admin-mobile" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Mobile Number
          </label>
          <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
            <div className="flex items-center gap-1 px-3.5 bg-slate-50/50 border-r border-slate-200 select-none cursor-pointer">
              <span className="text-xs font-bold text-slate-700 font-mono">+91</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-550" />
            </div>
            <input
              id="admin-mobile"
              type="tel"
              value={mobile}
              onChange={(e) => { setMobile(e.target.value); e.target.setCustomValidity(''); }}
              required
              placeholder="Enter mobile number"
              className="w-full py-3 px-3.5 text-sm outline-none bg-white text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <Input
          label="Email Address"
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); e.target.setCustomValidity(''); }}
          required
          placeholder="e.g. admin@healthflow.com"
          className="rounded-xl h-11"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 font-semibold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all h-[42px]"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            label="Date of Birth"
            id="admin-dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => { setDateOfBirth(e.target.value); e.target.setCustomValidity(''); }}
            className="rounded-xl h-11"
          />
        </div>

        <div className="flex items-center gap-2.5 pt-1.5">
          <input
            id="admin-status"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-slate-350 rounded-md focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <label htmlFor="admin-status" className="text-sm text-slate-700 font-semibold cursor-pointer select-none">
            Authorized Account Active State
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 mt-8 sm:bg-transparent sm:mx-0 sm:mb-0 sm:p-0 sm:justify-end w-full">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto sm:px-6 h-11 border-slate-200 text-slate-600 rounded-xl font-semibold text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:px-6 h-11 bg-brand-primary text-white rounded-xl font-semibold text-sm justify-center gap-2"
        >
          <span>Save</span>
        </Button>
      </div>
    </form>
  );
};
