import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Activity, 
  DollarSign, 
  Clock, 
  FileText, 
  Lock, 
  Check, 
  AlertCircle,
  Briefcase,
  Layers,
  Calendar,
  KeyRound,
  Building,
  Globe,
  MapPin,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { mockUsersApi } from '../../users/utils/mockUsersApi';
import { DoctorUser, AdminUser, StaffUser } from '../../users/types';

let isFetchingProfile = false;

export const ProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      const user = JSON.parse(cached);
      setCurrentUser(user);

      if (isFetchingProfile) {
        return;
      }
      isFetchingProfile = true;
      // Reset lock after a short delay so that tab transitions or later page returns fetch updated profile
      setTimeout(() => {
        isFetchingProfile = false;
      }, 1000);

      // Load profile with a single optimized API request using the security token
      fetch('/api/v1/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(response => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('healthflow_user');
          window.location.href = '/login?expired=true';
          throw new Error('Session expired');
        }
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(resData => {
        if (resData && resData.data) {
          setProfileDetails(resData.data);
          if (resData.data.clinic) {
            setClinicData(resData.data.clinic);
          }
        } else {
          setProfileDetails(user);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setProfileDetails(user);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword,
          newPassword
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('healthflow_user');
        window.location.href = '/login?expired=true';
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.');
      }

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Profile...</span>
      </div>
    );
  }

  const role = currentUser?.role?.toUpperCase() || 'STAFF';

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto pb-10">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm h-18">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/more')}
              className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-[#094093] font-display ml-1">
              Account Profile
            </h2>
          </div>
          <div>
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer shadow-xs"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      )}

      <div className={isMobile ? 'px-6 space-y-6' : 'space-y-8'}>
        {/* Header */}
        {!isMobile && (
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Account Profile</h1>
            <p className="text-sm text-slate-500">
              View your credential coordinates and manage your access security configuration.
            </p>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Card Summary & Clinic Profile */}
        <div className="space-y-6 self-start">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600 font-bold text-3xl uppercase">
                {profileDetails?.avatarUrl ? (
                  <img src={profileDetails.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  profileDetails?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'US'
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{profileDetails?.name || currentUser?.name}</h2>
                <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                  {role}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                 <Mail className="w-4.5 h-4.5 text-slate-400" />
                 <span className="truncate">{profileDetails?.email || currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                 <Phone className="w-4.5 h-4.5 text-slate-400" />
                 <span>{profileDetails?.mobile || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Clinic Profile Card */}
          {clinicData && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-[#111827] rounded-2xl shadow-xl p-6 text-slate-300 border border-slate-800 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {clinicData.logoUrl ? (
                    <img src={clinicData.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-md leading-tight">{clinicData.name}</h3>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mt-1">
                    PRIMARY PRACTICE
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-5 space-y-4 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{clinicData.phone || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{clinicData.email || 'Not specified'}</span>
                </div>
                {clinicData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-indigo-400 truncate">{clinicData.website}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[11px]">
                    {clinicData.addressLine ? `${clinicData.addressLine}, ` : ''}
                    {clinicData.city ? `${clinicData.city}, ` : ''}
                    {clinicData.state ? `${clinicData.state}, ` : ''}
                    {clinicData.pincode ? `${clinicData.pincode}, ` : ''}
                    {clinicData.country || 'India'}
                  </span>
                </div>
              </div>

              {(clinicData.gstNumber || clinicData.registrationNumber) && (
                <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3.5 flex justify-between gap-4 text-left">
                  {clinicData.gstNumber && (
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GSTIN</div>
                      <div className="text-xs font-black text-white mt-1 font-mono">{clinicData.gstNumber}</div>
                    </div>
                  )}
                  {clinicData.registrationNumber && (
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CLINIC REG</div>
                      <div className="text-xs font-black text-white mt-1 font-mono">{clinicData.registrationNumber}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Details and Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">Professional & Profile Details</h3>
            </div>

            {role === 'DOCTOR' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Specialization</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{profileDetails?.specialization}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Qualification</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{profileDetails?.qualification}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Experience</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.experience} in medicine</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consultation Fee</span>
                  <div className="font-bold text-blue-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>${Number(profileDetails?.fee || 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Follow-up Fee</span>
                  <div className="font-bold text-blue-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>${Number(profileDetails?.followupFee || 60).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Working Hours</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{profileDetails?.workingHours}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registration Number</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-mono">{profileDetails?.registrationNumber}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Joining Date</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.joiningDate}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.gender || 'Female'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.dateOfBirth || 'Not specified'}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4.5 h-4.5 text-blue-600" />
                    <span>{profileDetails?.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mobile Contact</span>
                  <div className="font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4.5 h-4.5 text-blue-600" />
                    <span>{profileDetails?.mobile || 'Not specified'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.gender || 'Not specified'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date of Birth</span>
                  <div className="font-semibold text-slate-700">{profileDetails?.dateOfBirth || 'Not specified'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-base">Change Password</h3>
            </div>

            {passwordError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-3 text-sm font-medium animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3 text-sm font-medium">
                <Check className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choose new password"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
