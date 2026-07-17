import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, ShieldCheck, HelpCircle, Activity, LayoutGrid, Calendar, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authService } from '../../../lib/apiClient';

interface LoginPageProps {
  onLoginSuccess: (user: { firstName: string; lastName: string; role: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@healthflow.com');
  const [password, setPassword] = useState('AdminPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (email.trim() === '' || password.trim() === '') {
      setError('Please enter both your email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.login(email.trim(), password);
      
      const nameParts = (data.name || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userObj = {
        id: data.id,
        name: data.name,
        firstName,
        lastName,
        role: data.role,
        email: data.email,
        token: data.token,
        avatarUrl: (data as any).avatarUrl || ''
      };

      localStorage.setItem('healthflow_user', JSON.stringify(userObj));
      onLoginSuccess(userObj);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Authentication failed. Please verify your credentials and check if the server is running.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Primary Split Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Visual Presentation Panel (responsive hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 bg-gradient-to-br from-blue-50 to-sky-100/50 border-r border-slate-100 relative overflow-hidden">
          {/* Subtle design bubbles */}
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />

          <div className="relative space-y-12 max-w-xl">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                Manage your clinic with ease
              </h2>
              <p className="text-base text-slate-500 font-medium leading-relaxed">
                Appointments, patients, billing, doctors and reports in one simple dashboard.
              </p>
            </div>

            {/* Simulated interactive mini dashboard cards */}
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-md flex items-center gap-5 transform hover:translate-x-1.5 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/10 shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
                  <div className="h-2.5 bg-slate-100/60 rounded-full w-1/3" />
                </div>
              </div>

              {/* Multi group card */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-md flex flex-col gap-4 transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-100/60 rounded-full w-1/2" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-md flex flex-col gap-4 transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-100/60 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Monitor Setup Realistic UI Showcase */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-2xl bg-[#0f172a] p-3 aspect-video">
              {/* Styled Mock monitor screen */}
              <div className="h-full rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
                {/* Mock Top navbar */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">HealthFlow Clinic</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                </div>

                {/* Main page center */}
                <div className="flex-1 py-4 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Welcome back Neha</span>
                  <p className="text-sm font-semibold text-white tracking-tight">Active Consultations Panel</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Streamline and diagnose patient notes, billing statuses, and records.</p>
                </div>

                {/* Bottom details */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[9px] text-slate-500 font-mono">
                  <span>SSL_SECURE: 256_AES</span>
                  <span>CLOCK: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form Panel */}
        <div className="flex flex-col justify-center items-center px-4 py-10 xs:px-6 md:px-12 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-blue-50/30 relative overflow-hidden">
          {/* Subtle background glow orbs for mobile layout depth */}
          <div className="absolute top-[-15%] left-[-15%] w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-15%] w-96 h-96 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

          <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up">
            {/* Logo Badge at the top of the form container */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/25 animate-pulse -z-10 scale-110 blur-xs" />
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 relative z-10 transition-transform duration-300 group-hover:scale-105">
                  <Activity className="w-7 h-7 animate-pulse" />
                </div>
              </div>
              <h1 className="font-display font-extrabold text-3xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 bg-clip-text text-transparent flex items-center gap-2 mt-2">
                HealthFlow
              </h1>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 tracking-wide uppercase text-xs">Welcome Back</p>
                <p className="text-xs text-slate-450 font-medium">Login to continue to your secure clinic dashboard</p>
              </div>
            </div>

            {/* Premium glassmorphic card wrapper */}
            <div className="bg-white/80 backdrop-blur-md p-6 xs:p-8 border border-white/60 rounded-3xl shadow-xl shadow-blue-950/5 relative z-10 animate-scale-in">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-semibold border border-rose-100 flex items-center gap-2 shadow-2xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthflow.com"
                  required
                  rightIcon={<Mail className="w-4 h-4 text-slate-450" />}
                  className="rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50"
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  rightIcon={
                    showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-450 hover:text-slate-755 transition-colors" onClick={() => setShowPassword(false)} />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-450 hover:text-slate-755 transition-colors" onClick={() => setShowPassword(true)} />
                    )
                  }
                  className="rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50"
                />

                {/* Remember & Forgot row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-650 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 accent-blue-600 border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs transition-all rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.985] uppercase tracking-wider h-11 flex items-center justify-center cursor-pointer border border-transparent"
                  isLoading={isLoading}
                >
                  <span>Login</span>
                  <span className="ml-1">&rarr;</span>
                </Button>
              </form>

              {/* Secure compliance badge */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2.5 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3.5 shadow-3xs text-[10px] font-bold text-emerald-800 tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Secure HIPAA Compliant Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <footer className="py-6 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 HealthFlow. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <span className="text-slate-200">|</span>
            <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <span className="text-slate-200">|</span>
            <a href="#support" className="hover:text-slate-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
