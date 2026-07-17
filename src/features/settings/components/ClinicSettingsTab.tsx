import React, { useState, useEffect, useRef } from 'react';
import { Building, Phone, Mail, Globe, MapPin, DollarSign, Languages, Upload, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ClinicSettings } from '../types';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface ClinicSettingsTabProps {
  initialSettings: ClinicSettings;
  onSave: (data: ClinicSettings) => void;
}

export const ClinicSettingsTab: React.FC<ClinicSettingsTabProps> = ({ initialSettings, onSave }) => {
  const [formData, setFormData] = useState<ClinicSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (field: keyof ClinicSettings, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation: Size must be less than 1MB (1024 * 1024 bytes)
    if (file.size >= 1024 * 1024) {
      setUploadError("File size must be less than 1MB");
      return;
    }

    // Frontend validation: Must be PNG
    if (file.type !== "image/png") {
      setUploadError("Only PNG files are allowed");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      // Call Backend API using fetch
      const tokenCached = localStorage.getItem('healthflow_user');
      let headers: HeadersInit = {};
      if (tokenCached) {
        const parsed = JSON.parse(tokenCached);
        if (parsed && parsed.token) {
          headers["Authorization"] = `Bearer ${parsed.token}`;
        }
      }

      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: headers,
        body: formDataUpload
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // The URL returned from backend is "/api/v1/uploads/{uploadId}"
        const downloadUrl = result.data.url;
        handleChange('logoUrl', downloadUrl);
      } else {
        setUploadError(result.message || "Failed to upload logo");
      }
    } catch (err: any) {
      setUploadError("Error uploading file: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return isMobile ? (
    <form onSubmit={handleSubmit} className="space-y-6 text-left pb-24">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png"
        className="hidden"
      />
      {/* Card 1: Clinic Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-extrabold text-blue-600 text-sm tracking-tight">Clinic Profile</h3>
        </div>

        {/* Logo upload dropzone block */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
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
          <div className="text-center space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800">Clinic Logo</h4>
            <p className="text-[10px] font-semibold text-slate-450 leading-relaxed">
              Recommended: Square 256x256px
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleLogoUploadClick}
                className="px-4.5 h-8.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => handleChange('logoUrl', null)}
                  className="px-4 h-8.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            {uploadError && (
              <p className="text-rose-600 text-[10px] font-bold mt-1 text-center animate-pulse">
                {uploadError}
              </p>
            )}
            {isUploading && (
              <p className="text-blue-600 text-[10px] font-bold mt-1 text-center animate-pulse">
                Uploading...
              </p>
            )}
          </div>
        </div>

        {/* General input fields */}
        <div className="space-y-4 pt-1">
          {/* Clinic Name */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Clinic Brand Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. HealthFlow Specialty Center"
                className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Clinic Phone */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Primary Phone Contact *
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-550 text-sm font-bold">
                +91
              </span>
              <input
                type="tel"
                required
                value={formData.phone ? formData.phone.replace(/^\+91\s?/, '') : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('phone', '+91 ' + digits);
                }}
                placeholder="98765 00001"
                className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Clinic Email */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Primary Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. contact@practice.com"
                className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Website URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value || null)}
                placeholder="e.g. www.practice.com"
                className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              GST Number (Optional)
            </label>
            <input
              type="text"
              value={formData.gstNumber || ''}
              onChange={(e) => handleChange('gstNumber', e.target.value || null)}
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-705 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Clinic Registration Number */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Registration Number (Optional)
            </label>
            <input
              type="text"
              value={formData.registrationNumber || ''}
              onChange={(e) => handleChange('registrationNumber', e.target.value || null)}
              placeholder="e.g. REG-2023-88910"
              className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-705 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Registered Address */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-extrabold text-blue-600 text-sm tracking-tight">Address Details</h3>
        </div>

        <div className="space-y-4">
          {/* Address Line */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.addressLine}
              onChange={(e) => handleChange('addressLine', e.target.value)}
              placeholder="e.g. Suite 200, 452 Innovation Blvd"
              className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Metropolis"
                className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                State *
              </label>
              <select
                required
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Country & Pincode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="India">India</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Pincode / Zip *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="e.g. 110001"
                className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Regional Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-extrabold text-blue-600 text-sm tracking-tight">Regional Preferences</h3>
        </div>

        <div className="space-y-4">
          {/* Local Currency */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Local Currency *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
              </select>
            </div>
          </div>

          {/* System Language */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              System Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="English (India)">English (India)</option>
              <option value="English (US)">English (US)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Alert Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-left">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs text-slate-650 leading-normal font-semibold">
            Ensure your registration details match your official licensing documents. Profile fields updated here will be reflected on print headers and PDF invoice receipts.
          </p>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-4 flex gap-3 shadow-lg justify-between">
        <button
          type="button"
          onClick={() => setFormData(initialSettings)}
          className="flex-1 max-w-[120px] h-11 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
        >
          Cancel
        </button>

        <div className="flex-1 flex items-center gap-2 justify-end">
          {saveSuccess && (
            <span className="text-emerald-600 text-[10px] font-bold shrink-0 animate-pulse hidden xs:inline">
              Saved!
            </span>
          )}
          <button
            type="submit"
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all rounded-xl shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </form>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Left Column (2/3 width) - Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png"
            className="hidden"
          />

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
                {uploadError && (
                  <p className="text-rose-600 text-[11px] font-bold mt-1.5 text-center sm:text-left animate-pulse">
                    {uploadError}
                  </p>
                )}
                {isUploading && (
                  <p className="text-indigo-600 text-[11px] font-bold mt-1.5 text-center sm:text-left animate-pulse">
                    Uploading logo...
                  </p>
                )}
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
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Clinic Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Primary Phone Contact *
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={formData.phone ? formData.phone.replace(/^\+91\s?/, '') : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '');
                      handleChange('phone', '+91 ' + digits);
                    }}
                    placeholder="98765 00001"
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-r-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value || null)}
                    placeholder="e.g. www.practice.com"
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    State *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="India">India</option>
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
                    placeholder="e.g. 110001"
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
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
                  className="w-full px-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="English (India)">English (India)</option>
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
