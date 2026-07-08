import { useState } from 'react';
import { Settings, Shield, Mail, Bell, HardDrive, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

// Placeholder Components - will implement next
import { GeneralSettings } from './GeneralSettings';
import { SecuritySettings } from './SecuritySettings';
import { SystemSettings } from './SystemSettings';

const TABS = [
  { id: 'general', name: 'General', icon: Settings },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'email', name: 'Email (SMTP)', icon: Mail },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'system', name: 'System', icon: HardDrive },
];

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulating form change detection
  const handleFormChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setIsDirty(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1000);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings onChange={handleFormChange} />;
      case 'security': return <SecuritySettings onChange={handleFormChange} />;
      case 'system': return <SystemSettings onChange={handleFormChange} />;
      default: return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Settings module under construction.</p>
        </div>
      );
    }
  };

  return (
    <div className="relative pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage global platform configurations and security policies.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:w-1/4">
          <nav className="flex flex-col space-y-1 sticky top-24">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="lg:w-3/4">
          {renderActiveTab()}
        </div>
      </div>

      {/* The Dirty-State Save Bar */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 lg:pl-64 z-40
          transform transition-transform duration-300 ease-in-out
          ${isDirty || saveSuccess ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-700">Settings saved successfully.</span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-700">You have unsaved changes.</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setIsDirty(false)}
                disabled={isSaving || saveSuccess}
              >
                Discard
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
