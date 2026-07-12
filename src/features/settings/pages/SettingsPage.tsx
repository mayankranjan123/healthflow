import React, { useState } from 'react';
import { Settings, Building, Receipt, Pill, UserSquare2 } from 'lucide-react';
import { mockSettingsApi } from '../utils/mockSettingsApi';
import { ClinicSettingsTab } from '../components/ClinicSettingsTab';
import { BillingSettingsTab } from '../components/BillingSettingsTab';
import { PrescriptionSettingsTab } from '../components/PrescriptionSettingsTab';
import { SettingsState, ClinicSettings, BillingSettings, PrescriptionSettings } from '../types';
import { UsersPage } from '../../users/pages/UsersPage';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [activeTab, setActiveTab] = useState<'CLINIC' | 'USERS' | 'BILLING' | 'PRESCRIPTION'>('CLINIC');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    mockSettingsApi.getSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const handleSaveClinic = async (updatedClinic: ClinicSettings) => {
    const updated = await mockSettingsApi.updateClinicSettings(updatedClinic);
    setSettings(updated);
  };

  const handleSaveBilling = async (updatedBilling: BillingSettings) => {
    const updated = await mockSettingsApi.updateBillingSettings(updatedBilling);
    setSettings(updated);
  };

  const handleSavePrescription = async (updatedPrescription: PrescriptionSettings) => {
    const updated = await mockSettingsApi.updatePrescriptionSettings(updatedPrescription);
    setSettings(updated);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title & Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Settings className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-sm text-slate-500 font-medium">Configure clinic details, billing preferences and prescription templates</p>
        </div>
      </div>

      {/* Tabs Selection Rail */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          
          {/* Tab 1: Clinic Settings */}
          <button
            onClick={() => setActiveTab('CLINIC')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CLINIC'
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Building className="w-4.5 h-4.5" />
            <span>Clinic Settings</span>
          </button>

          {/* Tab 2: Users & Roles */}
          <button
            onClick={() => setActiveTab('USERS')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'USERS'
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserSquare2 className="w-4.5 h-4.5" />
            <span>Users & Roles</span>
          </button>

          {/* Tab 2: Billing Settings */}
          <button
            onClick={() => setActiveTab('BILLING')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'BILLING'
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Receipt className="w-4.5 h-4.5" />
            <span>Billing Settings</span>
          </button>

          {/* Tab 3: Prescription Settings */}
          <button
            onClick={() => setActiveTab('PRESCRIPTION')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'PRESCRIPTION'
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Pill className="w-4.5 h-4.5" />
            <span>Prescription Settings</span>
          </button>

        </div>
      </div>

      {/* Render Active Tab Component */}
      <div className="pt-2">
        {activeTab === 'CLINIC' && (
          <ClinicSettingsTab
            initialSettings={settings.clinic}
            onSave={handleSaveClinic}
          />
        )}

        {activeTab === 'USERS' && (
          <UsersPage hideHeader={true} />
        )}

        {activeTab === 'BILLING' && (
          <BillingSettingsTab
            initialSettings={settings.billing}
            clinicName={settings.clinic.name}
            clinicAddress={`${settings.clinic.addressLine}, ${settings.clinic.city}, ${settings.clinic.state} - ${settings.clinic.pincode}`}
            clinicPhone={settings.clinic.phone}
            clinicGst={settings.clinic.gstNumber}
            onSave={handleSaveBilling}
          />
        )}

        {activeTab === 'PRESCRIPTION' && (
          <PrescriptionSettingsTab
            initialSettings={settings.prescription}
            clinicName={settings.clinic.name}
            clinicAddress={`${settings.clinic.addressLine}, ${settings.clinic.city}`}
            clinicPhone={settings.clinic.phone}
            onSave={handleSavePrescription}
          />
        )}
      </div>

    </div>
  );
};
