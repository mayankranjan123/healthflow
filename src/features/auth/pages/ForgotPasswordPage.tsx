import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Activity } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 900);
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
          <h2 className="text-xl font-bold text-slate-800">Reset your password</h2>
          <p className="text-sm text-slate-500 max-w-xs">
            We'll send you an email instructions link to reset your administrator or clinician account.
          </p>
        </div>

        <div className="bg-white p-8 border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/80">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@healthflow.com"
                required
                rightIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                className="w-full mt-4 py-3"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-800">Check your inbox</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, we have sent password reset instructions to it.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
