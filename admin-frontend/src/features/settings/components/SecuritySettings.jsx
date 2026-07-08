import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi } from '../api/adminSettingsApi';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { Loader2, CheckCircle } from 'lucide-react';

export const SecuritySettings = ({ onChange }) => {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminSettingsApi.getSettings,
  });

  const mutation = useMutation({
    mutationFn: adminSettingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      if (onChange) onChange();
    },
  });

  const handleToggle = (key, value) => {
    mutation.mutate({ [key]: String(value) });
  };

  const handleSessionTimeout = (e) => {
    e.preventDefault();
    const timeout = e.target.elements.sessionTimeout.value;
    mutation.mutate({ 'security.sessionTimeout': timeout });
  };

  const mfaEnabled = settings['security.mfaRequired'] === 'true';
  const sessionTimeout = settings['security.sessionTimeout'] || '60';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Authentication Security</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage global login and session security policies. All changes persist to the database.
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <ul className="divide-y divide-gray-100">
            {/* MFA Toggle — saved immediately on toggle */}
            <li className="py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">Enforce Multi-Factor Authentication (MFA)</p>
                <p className="text-sm text-gray-500">
                  Require all admin accounts to configure MFA upon their next login.
                </p>
              </div>
              <Toggle
                enabled={mfaEnabled}
                onChange={(v) => handleToggle('security.mfaRequired', v)}
                srLabel="Enforce MFA"
              />
            </li>
          </ul>

          {/* Session Timeout — requires explicit save */}
          <form onSubmit={handleSessionTimeout} className="pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Idle Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  id="sessionTimeout"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                  defaultValue={sessionTimeout}
                  min={5}
                  max={480}
                />
                <p className="mt-2 text-xs text-gray-500">Automatically logs out inactive users (5–480 min).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {mutation.isSuccess && (
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" /> Saved
                </span>
              )}
              <Button type="submit" variant="secondary" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Timeout
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
