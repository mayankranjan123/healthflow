import React, { useState } from 'react';
import { Settings, Building, Receipt, Pill, UserSquare2, ChevronRight, Info, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockSettingsApi } from '../utils/mockSettingsApi';
import { ClinicSettingsTab } from '../components/ClinicSettingsTab';
import { BillingSettingsTab } from '../components/BillingSettingsTab';
import { PrescriptionSettingsTab } from '../components/PrescriptionSettingsTab';
import { SettingsState, ClinicSettings, BillingSettings, PrescriptionSettings } from '../types';
import { UsersPage } from '../../users/pages/UsersPage';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLINIC' | 'USERS' | 'BILLING' | 'PRESCRIPTION'>('CLINIC');
  const [activeMobileTab, setActiveMobileTab] = useState<'CLINIC' | 'USERS' | 'BILLING' | 'PRESCRIPTION' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

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

  React.useEffect(() => {
    const cached = localStorage.getItem('healthflow_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
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

  const handleMobileTabSelection = (tab: 'CLINIC' | 'USERS' | 'BILLING' | 'PRESCRIPTION') => {
    setActiveTab(tab);
    setActiveMobileTab(tab);
  };

  const renderActiveTabComponent = () => {
    if (activeTab === 'CLINIC') {
      return !clinic ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-semibold mt-4 text-sm">Loading Clinic Settings...</span>
        </div>
      ) : (
        <ClinicSettingsTab
          initialSettings={clinic}
          onSave={handleSaveClinic}
        />
      );
    }

    if (activeTab === 'USERS') {
      return <UsersPage hideHeader={true} />;
    }

    if (activeTab === 'BILLING') {
      return (!clinic || !billing) ? (
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
          isMobile={isMobile}
        />
      );
    }

    if (activeTab === 'PRESCRIPTION') {
      return (!clinic || !prescription) ? (
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
      );
    }

    return null;
  };

  if (isMobile) {
    return (
      <div className="space-y-6 pb-24 -mx-6 -mt-6">
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm h-18">
          <div className="flex items-center gap-2">
            {activeMobileTab === null ? (
              <button
                onClick={() => navigate('/more')}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => setActiveMobileTab(null)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-lg font-bold text-[#094093] font-display ml-1">
              {activeMobileTab === null
                ? 'Settings'
                : activeMobileTab === 'CLINIC'
                  ? 'Clinic Settings'
                  : activeMobileTab === 'USERS'
                    ? 'Users & Roles'
                    : activeMobileTab === 'BILLING'
                      ? 'Billing Settings'
                      : 'Prescription Settings'}
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

        {/* Mobile Page Content */}
        <div className="px-6 space-y-5 animate-fade-in-up">
          {activeMobileTab === null ? (
            <>
              {/* Info Badges & Subtitle */}
              <div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#0c66e4] text-white text-[10px] font-black uppercase tracking-wider rounded px-2.5 py-1">
                    ADMIN
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    v2.4.0
                  </span>
                </div>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mt-3">
                  Configure your clinic's workspace and operational preferences.
                </p>
              </div>

              {/* Navigation settings cards stack */}
              <div className="space-y-4 pt-1">
                <div
                  onClick={() => handleMobileTabSelection('CLINIC')}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-sm">Clinic Settings</h4>
                      <p className="text-[11px] text-slate-450 font-semibold mt-0.5 leading-snug">
                        Manage general info, locations, and branding.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                <div
                  onClick={() => handleMobileTabSelection('USERS')}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <UserSquare2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-sm">Users & Roles</h4>
                      <p className="text-[11px] text-slate-450 font-semibold mt-0.5 leading-snug">
                        Access control and staff management.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                <div
                  onClick={() => handleMobileTabSelection('BILLING')}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-sm">Billing Settings</h4>
                      <p className="text-[11px] text-slate-450 font-semibold mt-0.5 leading-snug">
                        Invoices, plans, and payments.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                <div
                  onClick={() => handleMobileTabSelection('PRESCRIPTION')}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-sm">Prescription Settings</h4>
                      <p className="text-[11px] text-slate-450 font-semibold mt-0.5 leading-snug">
                        eRx configuration and drug database.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Administrative warning block */}
              <div className="border border-dashed border-slate-350 bg-slate-50/50 rounded-2xl p-4 flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-550 font-semibold leading-relaxed text-left">
                  Some settings may require administrative elevation to modify. Please contact the Clinic Director for permission changes.
                </p>
              </div>
            </>
          ) : (
            <div className="pt-2 text-left">
              {renderActiveTabComponent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title & Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-600">
          <Settings className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="text-left">
          <h2 className="font-display font-extrabold text-slate-900 tracking-tight text-2xl">Settings</h2>
          <p className="text-slate-500 font-semibold text-sm">Configure clinic details and regional preferences</p>
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
                ? 'border-indigo-600 text-indigo-700 font-black'
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
                ? 'border-indigo-600 text-indigo-700 font-black'
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
                ? 'border-indigo-600 text-indigo-700 font-black'
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
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Prescription Settings</span>
          </button>
        </div>
      </div>

      {/* Render Active Tab Component */}
      <div className="pt-2 text-left">
        {renderActiveTabComponent()}
      </div>
    </div>
  );
};
