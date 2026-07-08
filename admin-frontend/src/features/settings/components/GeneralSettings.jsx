import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi } from '../api/adminSettingsApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader2, CheckCircle } from 'lucide-react';

export const GeneralSettings = ({ onChange }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      'platform.name': formData.get('platformName'),
      'platform.timezone': formData.get('timezone'),
      'platform.language': formData.get('language'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Brand Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">Update your platform's core identity. Changes persist to the database.</p>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <Input
                label="Platform Name"
                id="platformName"
                name="platformName"
                defaultValue={settings['platform.name'] || ''}
              />
              <p className="mt-2 text-sm text-gray-500">
                This name will be displayed in emails and the dashboard header.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Localization Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Localization</h3>
          <p className="mt-1 text-sm text-gray-500">Set default region and language preferences.</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Default Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={settings['platform.timezone'] || 'UTC'}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-shadow duration-200 border"
              >
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="EST">Eastern Standard Time (EST)</option>
                <option value="PST">Pacific Standard Time (PST)</option>
                <option value="IST">India Standard Time (IST)</option>
                <option value="CET">Central European Time (CET)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                System Language
              </label>
              <select
                id="language"
                name="language"
                defaultValue={settings['platform.language'] || 'en'}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-shadow duration-200 border"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 px-1">
        {mutation.isSuccess && (
          <span className="flex items-center text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-1" /> Saved successfully
          </span>
        )}
        {mutation.isError && (
          <span className="text-sm text-red-600 font-medium">Failed to save. Please try again.</span>
        )}
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
