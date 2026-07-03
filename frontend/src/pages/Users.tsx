import { useState, useEffect } from 'react';


import { Plus, Search, } from 'lucide-react';

const Users = () => {
  const [activeTab, setActiveTab] = useState('Admin');


  useEffect(() => {
    // Fetch users based on activeTab
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700">
          <Plus size={20} />
          <span>Add New {activeTab === 'Roles' ? 'Role' : activeTab}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['Admin', 'Doctor', 'Staff', 'Roles'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab !== 'Roles' && (
          <div className="p-4 border-b border-gray-200">
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()} by name/email`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
             </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-0 overflow-x-auto">
          {activeTab === 'Roles' ? (
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {['Patients Management', 'Appointments Management', 'Doctor Management', 'Billing', 'Report', 'Settings'].map((module, idx) => (
                   <tr key={idx}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600 rounded" />
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="checkbox" defaultChecked={module === 'Patients Management' || module === 'Appointments Management'} className="h-4 w-4 text-teal-600 rounded" />
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="checkbox" defaultChecked={module !== 'Report' && module !== 'Settings' && module !== 'Doctor Management'} className="h-4 w-4 text-teal-600 rounded" />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                  {activeTab === 'Doctor' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {/* Empty State for now */}
                 <tr>
                    <td colSpan={activeTab === 'Doctor' ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                       No {activeTab.toLowerCase()}s found.
                    </td>
                 </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
