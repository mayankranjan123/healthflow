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
}

export const RolesTab: React.FC<RolesTabProps> = ({ permissions, onSave }) => {
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

  return (
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
        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-xs">
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
              hasChanges ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
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
