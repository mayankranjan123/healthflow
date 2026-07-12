import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Activity, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authService } from '../../../lib/apiClient';

export const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Invalid or missing parameters in onboarding link.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // POST request to backend auth endpoint to set password
      const response = await fetch('http://localhost:8080/api/v1/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, password }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to configure password.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 md:px-6 py-12 font-sans relative">
      {/* Background design elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            HealthFlow
          </h1>
          <h2 className="text-xl font-bold text-slate-800">Set Account Password</h2>
          <p className="text-sm text-slate-500 max-w-xs">
            Complete your onboarding configuration to activate your clinician or administrator profile.
          </p>
        </div>

        <div className="bg-white p-8 border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/80">
          {error && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-3 text-sm font-medium animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</span>
                <div className="text-slate-700 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold select-none">
                  {email || 'Onboarding User'}
                </div>
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full mt-4 py-3"
                isLoading={isLoading}
              >
                Activate Account & Save
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
                <CheckCircle2 className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Onboarding Complete!</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mt-1">
                  Your credentials have been configured successfully. You can now access your dashboard.
                </p>
              </div>

              <Link to="/login" className="block pt-2">
                <Button className="w-full gap-2 py-3">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
