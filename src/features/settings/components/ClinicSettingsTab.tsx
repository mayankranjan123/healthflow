import React, { useState } from 'react';
import { Building, Phone, Mail, Globe, MapPin, DollarSign, Languages, Upload, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ClinicSettings } from '../types';

interface ClinicSettingsTabProps {
  initialSettings: ClinicSettings;
  onSave: (data: ClinicSettings) => void;
}

export const ClinicSettingsTab: React.FC<ClinicSettingsTabProps> = ({ initialSettings, onSave }) => {
  const [formData, setFormData] = useState<ClinicSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field: keyof ClinicSettings, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUploadClick = () => {
    // Simulate uploading a new logo with a high quality clinical icon from unsplash
    const logos = [
      'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80', // blue cross icon
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&auto=format&fit=crop&q=80', // stethoscope/med
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&auto=format&fit=crop&q=80', // clinical cross
    ];
    // Cycle logos or pick first
    const nextLogo = logos[Math.floor(Math.random() * logos.length)];
    handleChange('logoUrl', nextLogo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column (2/3 width) - Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Clinic Profile details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Clinic Profile</h3>
            </div>

            {/* Logo Upload Dropzone block */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-250 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl} 
                    alt="Clinic Logo Preview" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Building className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Clinic Logo</h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Recommended format: SVG, PNG or JPG. Square size (minimum 256x256 px).
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleLogoUploadClick}
                    className="px-3.5 h-8.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-100"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', null)}
                      className="px-3.5 h-8.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* General input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              {/* Clinic Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Clinic Brand Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. HealthFlow Specialty Center"
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Clinic Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Primary Phone Contact *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g. +91 98765 00001"
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Clinic Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Primary Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="e.g. contact@practice.com"
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="e.g. www.practice.com"
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* GST Number (optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gstNumber || ''}
                  onChange={(e) => handleChange('gstNumber', e.target.value || null)}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Clinic Registration Number (optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Registration Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleChange('registrationNumber', e.target.value || null)}
                  placeholder="e.g. REG-2023-88910"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Registered Address details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Registered Address</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Address Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) => handleChange('addressLine', e.target.value)}
                  placeholder="e.g. Suite 200, 452 Innovation Blvd"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Palo Alto"
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="e.g. California"
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pincode / Zipcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="e.g. 94301"
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Regional Preferences details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Languages className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Regional Preferences</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Currency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Currency Display *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  System Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="English">English (United States)</option>
                  <option value="Hindi">Hindi (भारत)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form action row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && (
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <ShieldCheck className="w-4 h-4" />
                <span>Clinic settings successfully updated!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Save Clinic Settings</span>
            </button>
          </div>

        </form>
      </div>

      {/* Right Column (1/3 width) - Sticky Preview Card */}
      <div className="space-y-6">
        <div className="sticky top-6 space-y-6">
          
          {/* Card 4: Clinic Profile preview visual layout card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5.5 shadow-md relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-indigo-600/10 blur-xl" />
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl" />

            <div className="relative space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Miniature" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Building className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white">{formData.name || 'Untitled Practice'}</h4>
                  <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">
                    PRIMARY PRACTICE
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3 text-xs font-semibold text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="font-mono">{formData.phone || 'No phone supplied'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="truncate">{formData.email || 'No email supplied'}</span>
                </div>
                {formData.website && (
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-indigo-400 hover:underline cursor-pointer truncate">{formData.website}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 pt-1.5 border-t border-white/5">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {[formData.addressLine, formData.city, formData.state, formData.pincode, formData.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>

              {/* GST display badge */}
              {(formData.gstNumber || formData.registrationNumber) && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/5 grid grid-cols-2 gap-2 text-[10px] font-bold font-mono text-slate-400 mt-2">
                  {formData.gstNumber && (
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500">GSTIN</span>
                      <span className="text-white mt-0.5 block">{formData.gstNumber}</span>
                    </div>
                  )}
                  {formData.registrationNumber && (
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500">CLINIC REG</span>
                      <span className="text-white mt-0.5 block">{formData.registrationNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Verification/Documentation assistance */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800">Clinic Verification</h4>
              <p className="text-xs text-amber-700/80 leading-normal font-medium">
                Ensure your GST and Registration details match your official licensing documents. Altered profile fields will automatically update on print headers and PDF invoice receipts.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
