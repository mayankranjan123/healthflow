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

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email);
      setMobile(staff.mobile);
      setAvatarUrl(staff.avatarUrl || '');
      setIsActive(staff.isActive);
    } else {
      setName('');
      setEmail('');
      setMobile('');
      setAvatarUrl('');
      setIsActive(true);
    }
  }, [staff]);

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
      id: staff?.id,
      name,
      email,
      mobile,
      avatarUrl: avatarUrl || undefined,
      isActive,
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
        <p className="text-[11px] text-slate-400 font-medium">PNG, JPG or GIF. Max 2MB.</p>
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
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            placeholder="e.g. +1 (555) 089-2244"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. staff@healthflow.com"
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
