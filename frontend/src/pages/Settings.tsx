const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {['Clinic Settings', 'Billing Settings', 'Prescription Settings'].map((tab, i) => (
            <button
              key={tab}
              className={`px-6 py-4 text-sm font-medium border-b-2 focus:outline-none ${
                i === 0
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8 text-center text-gray-500">
          Settings module is under construction.
        </div>
      </div>
    </div>
  );
};

export default Settings;
