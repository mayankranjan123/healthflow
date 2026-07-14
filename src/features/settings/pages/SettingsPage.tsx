import React, { useState } from 'react';
import { Settings, Building, Receipt, Pill, UserSquare2 } from 'lucide-react';
import { mockSettingsApi } from '../utils/mockSettingsApi';
import { ClinicSettingsTab } from '../components/ClinicSettingsTab';
import { BillingSettingsTab } from '../components/BillingSettingsTab';
import { PrescriptionSettingsTab } from '../components/PrescriptionSettingsTab';
import { SettingsState, ClinicSettings, BillingSettings, PrescriptionSettings } from '../types';
import { UsersPage } from '../../users/pages/UsersPage';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLINIC' | 'USERS' | 'BILLING' | 'PRESCRIPTION'>('CLINIC');
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);
  const [billing, setBilling] = useState<BillingSettings | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionSettings | null>(null);

  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);

  // Load Clinic Settings (needed for CLINIC, BILLING, and PRESCRIPTION tabs)
  React.useEffect(() => {
    const tabsNeedingClinic = ['CLINIC', 'BILLING', 'PRESCRIPTION'];
    if (tabsNeedingClinic.includes(activeTab) && !clinic && !isLoadingClinic) {
      setIsLoadingClinic(true);
      mockSettingsApi.getClinicSettings().then(data => {
        setClinic(data);
        setIsLoadingClinic(false);
      }).catch(() => setIsLoadingClinic(false));
    }
  }, [activeTab, clinic, isLoadingClinic]);

  // Load Billing Settings (needed for BILLING tab only)
  React.useEffect(() => {
    if (activeTab === 'BILLING' && !billing && !isLoadingBilling) {
      setIsLoadingBilling(true);
      mockSettingsApi.getBillingSettings().then(data => {
        setBilling(data);
        setIsLoadingBilling(false);
      }).catch(() => setIsLoadingBilling(false));
    }
  }, [activeTab, billing, isLoadingBilling]);

  // Load Prescription Settings (needed for PRESCRIPTION tab only)
  React.useEffect(() => {
    if (activeTab === 'PRESCRIPTION' && !prescription && !isLoadingPrescription) {
      setIsLoadingPrescription(true);
      mockSettingsApi.getPrescriptionSettings().then(data => {
        setPrescription(data);
        setIsLoadingPrescription(false);
      }).catch(() => setIsLoadingPrescription(false));
    }
  }, [activeTab, prescription, isLoadingPrescription]);

  const handleSaveClinic = async (updatedClinic: ClinicSettings) => {
    const updated = await mockSettingsApi.updateClinicSettings(updatedClinic);
    setClinic(updated.clinic);
  };

  const handleSaveBilling = async (updatedBilling: BillingSettings) => {
    const updated = await mockSettingsApi.updateBillingSettings(updatedBilling);
    setBilling(updated.billing);
  };

  const handleSavePrescription = async (updatedPrescription: PrescriptionSettings) => {
    const updated = await mockSettingsApi.updatePrescriptionSettings(updatedPrescription);
    setPrescription(updated.prescription);
  };

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

          {/* Tab 3: Billing Settings */}
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

          {/* Tab 4: Prescription Settings */}
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
          !clinic ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Clinic Settings...</span>
            </div>
          ) : (
            <ClinicSettingsTab
              initialSettings={clinic}
              onSave={handleSaveClinic}
            />
          )
        )}

        {activeTab === 'USERS' && (
          <UsersPage hideHeader={true} />
        )}

        {activeTab === 'BILLING' && (
          (!clinic || !billing) ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Billing Settings...</span>
            </div>
          ) : (
            <BillingSettingsTab
              initialSettings={billing}
              clinicName={clinic.name}
              clinicAddress={`${clinic.addressLine}, ${clinic.city}, ${clinic.state} - ${clinic.pincode}`}
              clinicPhone={clinic.phone}
              clinicGst={clinic.gstNumber}
              onSave={handleSaveBilling}
            />
          )
        )}

        {activeTab === 'PRESCRIPTION' && (
          (!clinic || !prescription) ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Prescription Settings...</span>
            </div>
          ) : (
            <PrescriptionSettingsTab
              initialSettings={prescription}
              clinicName={clinic.name}
              clinicAddress={`${clinic.addressLine}, ${clinic.city}`}
              clinicPhone={clinic.phone}
              onSave={handleSavePrescription}
            />
          )
        )}
      </div>

    </div>
  );
};
