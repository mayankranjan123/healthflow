import React, { useState } from 'react';
import { Pill, FileText, CheckCircle, ShieldCheck, Printer, ZoomIn } from 'lucide-react';
import { PrescriptionSettings } from '../types';

interface PrescriptionSettingsTabProps {
  initialSettings: PrescriptionSettings;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  onSave: (data: PrescriptionSettings) => void;
}

export const PrescriptionSettingsTab: React.FC<PrescriptionSettingsTabProps> = ({
  initialSettings,
  clinicName,
  clinicAddress,
  clinicPhone,
  onSave
}) => {
  const [formData, setFormData] = useState<PrescriptionSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (field: keyof PrescriptionSettings) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleValChange = (field: keyof PrescriptionSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const layoutStyles = [
    { id: 'CENTERED_PROFESSIONAL' as const, name: 'Centered Professional', desc: 'Symmetrical centered headers for premium prescription pads.' },
    { id: 'CLASSIC_LEFT' as const, name: 'Classic Left Header', desc: 'Standard traditional alignment with clinical logos on top left.' },
    { id: 'MODERN_MINIMAL' as const, name: 'Modern Minimal', desc: 'Understated fine lines with compact clinical details.' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column (2/3 width) - Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Prescription Layout Numbering */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Pill className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Prescription Pad Configurations</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Prescription Prefix */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Prescription ID Prefix
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => handleValChange('prefix', e.target.value)}
                  placeholder="e.g. RX"
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="text-[10px] font-bold text-slate-400 block">
                  Preview: <span className="font-mono text-indigo-600">{formData.prefix}-{formData.startingNumber}</span>
                </span>
              </div>

              {/* Starting Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Starting Rx Number
                </label>
                <input
                  type="number"
                  value={formData.startingNumber}
                  onChange={(e) => handleValChange('startingNumber', parseInt(e.target.value) || 1)}
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Auto-generate switch */}
              <div className="flex items-center justify-between pt-3 sm:col-span-2">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Auto-Generate Rx Numbers
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Auto-assign sequential numbers when printing prescriptions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('autoGenerateNumber')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    formData.autoGenerateNumber ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                      formData.autoGenerateNumber ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Header layout choices */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Rx Header Layout</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              {layoutStyles.map((style) => {
                const isSelected = formData.headerLayout === style.id;
                
                return (
                  <div
                    key={style.id}
                    onClick={() => handleValChange('headerLayout', style.id)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-36 relative select-none ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:border-slate-355 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="block font-bold text-slate-800 text-sm mt-2">{style.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">
                      {style.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Content Toggles */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Pill className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-base">Prescription Details & Print Toggles</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showClinicLogo}
                  onChange={() => handleToggle('showClinicLogo')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Clinic Logo / Crest</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDoctorQualifications}
                  onChange={() => handleToggle('showDoctorQualifications')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Doctor Qualifications (MD, DM)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDoctorDepartment}
                  onChange={() => handleToggle('showDoctorDepartment')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Doctor Department / Specialty</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showVitals}
                  onChange={() => handleToggle('showVitals')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Patient Vitals (BP, Temp, Pulse)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showPatientHistory}
                  onChange={() => handleToggle('showPatientHistory')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Patient History / Allergies</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDiagnosis}
                  onChange={() => handleToggle('showDiagnosis')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Clinical Diagnosis Block</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDuration}
                  onChange={() => handleToggle('showDuration')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Drug Treatment Course Duration</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.showDosageInstructions}
                  onChange={() => handleToggle('showDosageInstructions')}
                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>Show Dosage Intake Instructions</span>
              </label>
            </div>

            {/* Default Prescription Pad note */}
            <div className="space-y-1.5 pt-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Default Prescription Footnote Note
              </label>
              <textarea
                value={formData.defaultFooterNote}
                onChange={(e) => handleValChange('defaultFooterNote', e.target.value)}
                placeholder="e.g. Please take medicines on time and review if symptoms persist."
                className="w-full p-3.5 h-20 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Save trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && (
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Prescription layout parameters saved!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Save Prescription Pad Settings</span>
            </button>
          </div>

        </form>
      </div>

      {/* Right Column (1/3 width) - Sticky Prescription Preview */}
      <div className="space-y-6">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Rx Sheet Preview
            </h4>
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => alert('Opening prescription print layout simulator...')}
                title="Prescription Sheet Print"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rx Pad container layout */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-md p-5 min-h-[460px] flex flex-col justify-between text-[10px] text-slate-600 select-none">
            
            {/* Header section adapting to headerLayout */}
            <div className="space-y-4">
              
              {/* Header style */}
              <div className={`
                pb-3.5 border-b border-indigo-100 flex flex-col
                ${formData.headerLayout === 'CENTERED_PROFESSIONAL' ? 'text-center items-center' : ''}
                ${formData.headerLayout === 'CLASSIC_LEFT' ? 'text-left items-start' : ''}
                ${formData.headerLayout === 'MODERN_MINIMAL' ? 'text-left items-start border-b-2 border-slate-900 pb-2' : ''}
              `}>
                {formData.showClinicLogo && (
                  <div className="w-6 h-6 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs text-indigo-600 mb-1.5 font-extrabold">
                    ✚
                  </div>
                )}
                <h5 className="font-extrabold text-slate-900 text-xs tracking-tight">{clinicName}</h5>
                <p className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">{clinicAddress}</p>
                <p className="text-[8px] text-slate-400 font-medium leading-none mt-1">{clinicPhone}</p>
              </div>

              {/* Patient core info row */}
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3 text-[8.5px] font-semibold">
                <div>
                  <span className="text-slate-400 font-bold block text-[7px] uppercase tracking-wider">Patient Care Sheet</span>
                  <span className="font-extrabold text-slate-800">Suman Sharma (34 Yrs / F)</span>
                  <span className="block text-slate-400 font-mono mt-0.5">ID: PAT-99120 | Rx: {formData.prefix}-{formData.startingNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[7px] uppercase tracking-wider">Prescribing Clinician</span>
                  <span className="font-extrabold text-slate-800">Dr. Aisha Mehta</span>
                  {formData.showDoctorQualifications && <span className="block text-slate-400 font-semibold text-[7px]">MD, DM (Cardiology)</span>}
                  {formData.showDoctorDepartment && <span className="block text-slate-400 text-[7.5px] leading-none mt-0.5">Cardiologist</span>}
                </div>
              </div>

              {/* Vitals row if checked */}
              {formData.showVitals && (
                <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded text-[7.5px] text-center font-bold">
                  <div>
                    <span className="text-slate-400 block text-[6.5px]">BP</span>
                    <span className="text-slate-700 font-mono">122/80 mmHg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[6.5px]">PULSE</span>
                    <span className="text-slate-700 font-mono">74 bpm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[6.5px]">WEIGHT</span>
                    <span className="text-slate-700 font-mono">68 kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[6.5px]">TEMP</span>
                    <span className="text-slate-700 font-mono">98.4 °F</span>
                  </div>
                </div>
              )}

              {/* Clinical History & Diagnosis */}
              {(formData.showPatientHistory || formData.showDiagnosis) && (
                <div className="space-y-1.5 text-[8px] leading-normal">
                  {formData.showPatientHistory && (
                    <div className="font-semibold text-slate-500">
                      <strong className="text-slate-800">Allergies / History:</strong> Known Dust Allergy, Hypertension history.
                    </div>
                  )}
                  {formData.showDiagnosis && (
                    <div className="font-semibold text-slate-500">
                      <strong className="text-slate-800">Primary Diagnosis:</strong> Chronic Essential Hypertension.
                    </div>
                  )}
                </div>
              )}

              {/* Large Clinical Rx marker */}
              <div className="pt-2">
                <span className="text-lg font-black text-slate-900 leading-none">℞</span>
                
                {/* Drug lists mockup */}
                <div className="space-y-3 pt-2 pl-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-extrabold text-[9px] text-slate-800">
                      <span>1. Tab. Pantocid 40mg</span>
                      {formData.showDuration && <span className="text-slate-400 font-mono font-bold text-[8px]">10 Days Course</span>}
                    </div>
                    {formData.showDosageInstructions && (
                      <p className="text-[8px] text-slate-400 font-semibold">
                        Dosage: 1 - 0 - 0 (Once daily, morning) • Before Food
                      </p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between font-extrabold text-[9px] text-slate-800">
                      <span>2. Tab. Telvas 40mg</span>
                      {formData.showDuration && <span className="text-slate-400 font-mono font-bold text-[8px]">30 Days Course</span>}
                    </div>
                    {formData.showDosageInstructions && (
                      <p className="text-[8px] text-slate-400 font-semibold">
                        Dosage: 0 - 0 - 1 (Once daily, night) • After Food
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Default footnote & Signature area */}
            <div className="border-t border-slate-100 pt-3 flex items-end justify-between text-[7px] text-slate-400 font-semibold">
              <div className="max-w-[140px] leading-relaxed">
                {formData.defaultFooterNote && (
                  <p className="italic font-bold text-slate-500">
                    "{formData.defaultFooterNote}"
                  </p>
                )}
                <span className="block mt-1 font-mono text-[6px]">Prescription issued electronically by HealthFlow</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 border-t border-slate-350 mt-4" />
                <span className="uppercase font-bold text-[6px] tracking-wider block mt-1">
                  Dr. Aisha Mehta
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
