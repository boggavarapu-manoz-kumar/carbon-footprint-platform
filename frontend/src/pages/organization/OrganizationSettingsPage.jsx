import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosConfig';
import { Building2, Globe, Users, Briefcase, Save, Settings2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  'Technology', 'Manufacturing', 'Retail', 'Energy', 'Finance',
  'Healthcare', 'Education', 'Transportation', 'Agriculture', 'Other'
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '501-1000', label: '501–1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

const FormField = ({ label, required, icon: Icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      {children}
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
  </div>
);

export const OrganizationSettingsPage = () => {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '', industry: '', companySize: '', country: '', website: ''
  });
  const [errors, setErrors] = useState({});

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await api.get(`/v1/organizations/${orgId}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        industry: org.industry || '',
        companySize: org.companySize || '',
        country: org.country || '',
        website: org.website || ''
      });
    }
  }, [org]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Organization name is required';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website))
      errs.website = 'Must start with http:// or https://';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/v1/organizations/${orgId}`, data),
    onSuccess: () => {
      toast.success(t('organization.update_success', 'Settings updated successfully!'));
      queryClient.invalidateQueries(['organization', orgId]);
      queryClient.invalidateQueries(['myOrganizations']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('organization.update_error', 'Failed to update settings.'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) updateMutation.mutate(formData);
  };

  const isUnchanged = org &&
    formData.name === (org.name || '') &&
    formData.industry === (org.industry || '') &&
    formData.companySize === (org.companySize || '') &&
    formData.country === (org.country || '') &&
    formData.website === (org.website || '');

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-10 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="bg-white/80 rounded-2xl border border-slate-200 p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
            <Settings2 className="w-6 h-6" />
          </div>
          {t('organization.settings.title', 'Organization Settings')}
        </h2>
        <p className="text-slate-500 mt-1 font-medium ml-1">
          {t('organization.settings.desc', 'Update your organization profile and configuration.')}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-600">General Information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Organization Name */}
          <FormField label={t('organization.form.name', 'Organization Name')} required icon={Building2} error={errors.name}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
              placeholder="Acme Corporation"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industry */}
            <FormField label={t('organization.form.industry', 'Industry')} icon={Briefcase}>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 appearance-none"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </FormField>

            {/* Company Size */}
            <FormField label={t('organization.form.size', 'Company Size')} icon={Users}>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 appearance-none"
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>

            {/* Country */}
            <FormField label={t('organization.form.country', 'Country / Region')} icon={Globe}>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
              />
            </FormField>

            {/* Website */}
            <FormField label={t('organization.form.website', 'Website')} error={errors.website}>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 ${errors.website ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
              />
            </FormField>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              {isUnchanged ? 'No changes to save' : 'You have unsaved changes'}
            </p>
            <button
              type="submit"
              disabled={updateMutation.isPending || isUnchanged}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : t('common.save_changes', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 backdrop-blur-xl border border-red-200/60 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-red-700 mb-1">Danger Zone</h4>
        <p className="text-xs text-red-600/80 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <button
          type="button"
          disabled
          className="px-4 py-2 text-xs font-semibold text-red-700 border border-red-300 bg-white rounded-lg opacity-50 cursor-not-allowed"
        >
          Delete Organization (Contact Support)
        </button>
      </div>
    </div>
  );
};
