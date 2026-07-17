import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  CreditCard, 
  BarChart3, 
  Settings, 
  AlertCircle, 
  Check, 
  X,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ModulePermission } from '../types';

interface RolesTabProps {
  permissions: ModulePermission[];
  onSave: (updated: ModulePermission[]) => void;
  isMobile?: boolean;
}

export const RolesTab: React.FC<RolesTabProps> = ({ permissions, onSave, isMobile }) => {
  const [localPermissions, setLocalPermissions] = useState<ModulePermission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Initialize from props
  useEffect(() => {
    setLocalPermissions(JSON.parse(JSON.stringify(permissions)));
    setHasChanges(false);
  }, [permissions]);

  // Handle cell toggling
  const handleToggle = (moduleName: string, role: 'ADMIN' | 'DOCTOR' | 'STAFF') => {
    const updated = localPermissions.map((perm) => {
      if (perm.module === moduleName) {
        return {
          ...perm,
          [role]: !perm[role],
        };
      }
      return perm;
    });
    setLocalPermissions(updated);

    // Compare with original permissions to check for changes
    const isDifferent = JSON.stringify(updated) !== JSON.stringify(permissions);
    setHasChanges(isDifferent);
  };

  const handleReset = () => {
    setLocalPermissions(JSON.parse(JSON.stringify(permissions)));
    setHasChanges(false);
  };

  const handleSaveChanges = () => {
    onSave(localPermissions);
    setHasChanges(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Icon selector for each module
  const getModuleIcon = (module: string) => {
    const className = "w-5 h-5 text-blue-600";
    switch (module) {
      case 'patients':
        return <Users className={className} />;
      case 'appointments':
        return <Calendar className={className} />;
      case 'doctors':
        return <Activity className={className} />;
      case 'billing':
        return <CreditCard className={className} />;
      case 'reports':
        return <BarChart3 className={className} />;
      case 'settings':
        return <Settings className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  return isMobile ? (
    <div className="space-y-4 animate-fade-in relative text-left">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-4 right-4 z-50 flex items-center gap-3 bg-white border border-emerald-100 shadow-xl rounded-xl p-4 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Changes Saved</div>
            <div className="text-xs text-slate-500 font-medium">Role permissions updated successfully.</div>
          </div>
        </div>
      )}

      {/* Module Cards */}
      <div className="space-y-4 pb-28">
        {localPermissions.map((perm) => (
          <div key={perm.module} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {getModuleIcon(perm.module)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">{perm.label}</h4>
                <p className="text-[11px] text-slate-450 font-semibold leading-normal mt-0.5">{perm.description}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 -mx-5" />

            {/* Roles Matrix Toggles */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              {/* Admin */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Admin</span>
                <button
                  type="button"
                  onClick={() => handleToggle(perm.module, 'ADMIN')}
                  className="cursor-pointer focus:outline-none"
                >
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex ${perm.ADMIN ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'} items-center`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </button>
              </div>

              {/* Doctor */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Doctor</span>
                <button
                  type="button"
                  onClick={() => handleToggle(perm.module, 'DOCTOR')}
                  className="cursor-pointer focus:outline-none"
                >
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex ${perm.DOCTOR ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'} items-center`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </button>
              </div>

              {/* Staff */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Staff</span>
                <button
                  type="button"
                  onClick={() => handleToggle(perm.module, 'STAFF')}
                  className="cursor-pointer focus:outline-none"
                >
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex ${perm.STAFF ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'} items-center`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Actions / Warning Panel */}
      {hasChanges && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-amber-50 border-t border-amber-200 p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Unsaved changes will be lost if you navigate away.</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 h-11 border border-amber-200 bg-white hover:bg-slate-50 text-slate-505 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all rounded-xl shadow-3xs flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-emerald-100 shadow-xl rounded-xl p-4 animate-bounce max-w-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Changes Saved</div>
            <div className="text-xs text-slate-500 font-medium">Role permissions updated successfully.</div>
          </div>
        </div>
      )}

      {/* Permissions Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-40">Admin</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-40">Doctor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-40">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localPermissions.map((perm) => (
                <tr key={perm.module} className="hover:bg-slate-50/50 transition-colors">
                  {/* Module Name & Details */}
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        {getModuleIcon(perm.module)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{perm.label}</div>
                        <div className="text-xs text-slate-500 font-medium">{perm.description}</div>
                      </div>
                    </div>
                  </td>

                  {/* Admin Toggle */}
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleToggle(perm.module, 'ADMIN')}
                      className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {perm.ADMIN ? (
                        <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 transition-colors flex justify-end items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      ) : (
                        <div className="w-11 h-6 bg-slate-200 rounded-full p-0.5 transition-colors flex justify-start items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      )}
                    </button>
                  </td>

                  {/* Doctor Toggle */}
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleToggle(perm.module, 'DOCTOR')}
                      className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {perm.DOCTOR ? (
                        <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 transition-colors flex justify-end items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      ) : (
                        <div className="w-11 h-6 bg-slate-200 rounded-full p-0.5 transition-colors flex justify-start items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      )}
                    </button>
                  </td>

                  {/* Staff Toggle */}
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleToggle(perm.module, 'STAFF')}
                      className="inline-flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {perm.STAFF ? (
                        <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 transition-colors flex justify-end items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      ) : (
                        <div className="w-11 h-6 bg-slate-200 rounded-full p-0.5 transition-colors flex justify-start items-center">
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unsaved Warning Banner */}
      <div className={`
        p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 shadow-sm
        ${hasChanges ? 'border-amber-200 bg-amber-50/30' : ''}
      `}>
        <div className="flex items-center gap-2.5 text-slate-505 font-medium text-xs">
          {hasChanges ? (
            <>
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-amber-800 font-bold">Unsaved changes will be lost if you navigate away.</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <span>Permission modifications will take effect instantly for all logged-in accounts.</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition-all ${
              hasChanges ? 'hover:bg-slate-550 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Reset
          </button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className="gap-1.5 font-bold text-xs"
          >
            <span>Save Changes</span>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
