import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi } from '../api/adminSettingsApi';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, Trash2, Loader2, CheckCircle, Activity, ServerCrash } from 'lucide-react';

export const SystemSettings = ({ onChange }) => {
  const queryClient = useQueryClient();
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminSettingsApi.getSettings,
  });

  const { data: geminiHealth = {} } = useQuery({
    queryKey: ['admin', 'gemini-health'],
    queryFn: adminSettingsApi.getGeminiHealth,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const updateMutation = useMutation({
    mutationFn: adminSettingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      if (onChange) onChange();
    },
  });

  const purgeMutation = useMutation({
    mutationFn: adminSettingsApi.purgeCache,
    onSuccess: () => {
      setShowDangerModal(false);
      setConfirmText('');
    },
  });

  const maintenanceMode = settings['platform.maintenanceMode'] === 'true';

  const handleMaintenanceToggle = (value) => {
    updateMutation.mutate({ 'platform.maintenanceMode': String(value) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const isGeminiOnline = geminiHealth.status === 'ONLINE';

  return (
    <div className="space-y-6">
      {/* Operational Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">System Operations</h3>
          <p className="mt-1 text-sm text-gray-500">Configure global operational parameters. Changes are saved immediately.</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <ul className="divide-y divide-gray-100">
            <li className="py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">Enable Maintenance Mode</p>
                <p className="text-sm text-gray-500">
                  Blocks all non-admin traffic and displays a maintenance page to users.
                </p>
                {updateMutation.isSuccess && (
                  <span className="flex items-center text-xs text-green-600 font-medium mt-1">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Saved to database
                  </span>
                )}
              </div>
              <Toggle
                enabled={maintenanceMode}
                onChange={handleMaintenanceToggle}
                srLabel="Maintenance Mode"
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50/50 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-lg font-medium leading-6 text-red-800">Danger Zone</h3>
            <p className="mt-1 text-sm text-red-600">These actions are irreversible and affect system stability.</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Purge Application Cache</p>
              <p className="text-sm text-gray-500">Forces all edges to re-fetch data from the primary database.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowDangerModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Modal */}
      {showDangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => { setShowDangerModal(false); setConfirmText(''); }}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-center text-gray-500 mb-6">
                This action will purge the server cache. This may cause a temporary spike in database load.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please type <strong className="text-red-600 font-mono bg-red-50 px-1 rounded">purge cache</strong> to confirm.
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'purge cache' to confirm"
                  />
                </div>

                {purgeMutation.isError && (
                  <p className="text-sm text-red-600">Failed to purge cache. Please try again.</p>
                )}

                <div className="flex gap-3 w-full">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setShowDangerModal(false); setConfirmText(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className={`flex-1 ${confirmText === 'purge cache' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'opacity-50 cursor-not-allowed bg-red-600'}`}
                    disabled={confirmText !== 'purge cache' || purgeMutation.isPending}
                    onClick={() => purgeMutation.mutate()}
                  >
                    {purgeMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Purging...</>
                    ) : 'Execute Purge'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">AI Integration</h3>
            <p className="mt-1 text-sm text-gray-500">Configure the Gemini AI engine for smart user recommendations.</p>
          </div>
          {geminiHealth.status && (
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isGeminiOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {isGeminiOnline ? <Activity className="w-3.5 h-3.5 mr-1" /> : <ServerCrash className="w-3.5 h-3.5 mr-1" />}
              {isGeminiOnline ? 'Gemini Online & Active' : 'Gemini Offline - Local AI Active'}
            </div>
          )}
        </div>

        {!isGeminiOnline && geminiHealth.status === 'OFFLINE' && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <h4 className="text-sm font-semibold text-red-800 flex items-center mb-1">
              <AlertTriangle className="w-4 h-4 mr-1" /> AI Engine Failover Engaged
            </h4>
            <div className="text-xs text-red-700 mt-2 space-y-1">
              <p><span className="font-medium">Reason:</span> {geminiHealth.reason}</p>
              <p><span className="font-medium">Last Error:</span> {geminiHealth.lastError}</p>
              <p><span className="font-medium">Time:</span> {new Date(geminiHealth.time).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="px-6 py-6 space-y-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            const key = e.target.elements.geminiApiKey.value;
            updateMutation.mutate({ 'gemini.apiKey': key });
          }}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1 w-full max-w-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  name="geminiApiKey"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="AIzaSy..."
                  defaultValue={settings['gemini.apiKey'] || ''}
                />
                <p className="mt-2 text-xs text-gray-500">Leave blank to use the static recommendation fallback engine.</p>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Key
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
