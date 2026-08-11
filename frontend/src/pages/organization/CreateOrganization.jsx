import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosConfig';
import { Building2, Globe, Users, Briefcase, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateOrganization = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    companySize: '',
    country: '',
    website: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/v1/organizations', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('organization.create_success', 'Organization created successfully!'));
      queryClient.invalidateQueries(['myOrganizations']);
      // Assuming data contains the ID of the newly created organization
      navigate(`/organization/${data.id || ''}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('organization.create_error', 'Failed to create organization. It may already exist.'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('common.back_to_dashboard', 'Back to Dashboard')}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t('organization.create_title', 'Create an Organization')}</h1>
          </div>
          <p className="text-emerald-50 ml-16">
            {t('organization.create_desc', 'Set up your company workspace to collaborate and track sustainability goals together.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                {t('organization.form.name', 'Organization Name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
                {t('organization.form.industry', 'Industry')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 bg-white"
                >
                  <option value="">Select an industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Energy">Energy</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Company Size */}
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-1">
                {t('organization.form.size', 'Company Size')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 bg-white"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1 - 10 employees</option>
                  <option value="11-50">11 - 50 employees</option>
                  <option value="51-200">51 - 200 employees</option>
                  <option value="201-500">201 - 500 employees</option>
                  <option value="501-1000">501 - 1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('organization.form.country', 'Country')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900"
                    placeholder="e.g. United States"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('organization.form.website', 'Website')}
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900"
                  placeholder="https://example.com"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || !formData.name}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading ? t('common.creating', 'Creating...') : t('organization.create_btn', 'Create Organization')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganization;
