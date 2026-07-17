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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`space-y-6 animate-fade-in-up ${isMobile ? 'pb-24' : ''}`}>
      {/* Page Title & Header */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
          isMobile 
            ? 'bg-blue-50 border-blue-100 text-blue-600' 
            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
        }`}>
          <Settings className={`w-5 h-5 ${isMobile ? '' : 'animate-spin-slow'}`} />
        </div>
        <div className="text-left">
          <h2 className={`font-display font-extrabold text-slate-900 tracking-tight ${isMobile ? 'text-lg leading-tight' : 'text-2xl'}`}>Settings</h2>
          <p className={`text-slate-500 font-semibold ${isMobile ? 'text-[11px] leading-tight mt-1' : 'text-sm'}`}>Configure clinic details and regional preferences</p>
        </div>
      </div>

      {/* Tabs Selection Rail */}
      <div className="border-b border-slate-200 -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-5 whitespace-nowrap min-w-max pb-1">
          
          {/* Tab 1: Clinic Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('CLINIC')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CLINIC'
                ? isMobile
                  ? 'border-blue-600 text-blue-755 font-black'
                  : 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Clinic Settings</span>
          </button>

          {/* Tab 2: Users & Roles */}
          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'USERS'
                ? isMobile
                  ? 'border-blue-600 text-blue-755 font-black'
                  : 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserSquare2 className="w-4 h-4" />
            <span>Users & Roles</span>
          </button>

          {/* Tab 3: Billing Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('BILLING')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'BILLING'
                ? isMobile
                  ? 'border-blue-600 text-blue-755 font-black'
                  : 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Billing Settings</span>
          </button>

          {/* Tab 4: Prescription Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('PRESCRIPTION')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'PRESCRIPTION'
                ? isMobile
                  ? 'border-blue-600 text-blue-755 font-black'
                  : 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Pill className="w-4 h-4" />
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
