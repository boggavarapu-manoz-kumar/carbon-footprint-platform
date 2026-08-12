import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, User as UserCircle, CheckCircle } from 'lucide-react';
import SuperAdminOrganizationService from '../services/SuperAdminOrganizationService';

const industries = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
    'Education', 'Transportation', 'Energy', 'Construction', 'Consulting',
    'Media', 'Real Estate', 'Agriculture', 'Other'
];

const companySizes = [
    '1–10', '11–50', '51–200', '201–500', '501–1000', '1001–5000', '5000+'
];

const timezones = [
    'UTC', 'Asia/Kolkata', 'America/New_York', 'America/Chicago',
    'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'
];

export default function CreateOrganizationForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = Org details, 2 = Admin assignment
    const [form, setForm] = useState({
        name: '', industry: '', companySize: '', country: '', timezone: 'UTC', logo: '',
        adminName: '', adminEmail: '', adminIdentifier: ''
    });
    const [errors, setErrors] = useState({});

    const createMutation = useMutation({
        mutationFn: (data) => SuperAdminOrganizationService.createOrganization(data),
        onSuccess: () => {
            navigate('/organizations', { state: { success: true } });
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Failed to create organization. Please try again.';
            setErrors({ submit: msg });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(e => ({ ...e, [name]: undefined }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Organization name is required';
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!form.adminName.trim()) newErrors.adminName = 'Admin name is required';
        if (!form.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) newErrors.adminEmail = 'Enter a valid email address';
        return newErrors;
    };

    const handleNext = () => {
        const errs = validateStep1();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validateStep2();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        createMutation.mutate(form);
    };

    const inputClass = (field) =>
        `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
            errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-emerald-500'
        }`;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate('/organizations')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {step === 2 ? 'Back to Organization Details' : 'Back to Organizations'}
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Create New Organization</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Set up the organization and assign an administrator. The admin will receive an email to activate their account.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center mb-8">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors ${
                    step >= 1 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 text-gray-500'
                }`}>
                    {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors ${
                    step >= 2 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 text-gray-500'
                }`}>
                    2
                </div>
                <div className="flex items-center ml-3">
                    <span className={`text-xs font-medium ${step === 2 ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {step === 1 ? 'Organization Details' : 'Assign Administrator'}
                    </span>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${step === 1 ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                    {step === 1 ? (
                        <Building className="w-6 h-6 text-emerald-600" />
                    ) : (
                        <UserCircle className="w-6 h-6 text-indigo-600" />
                    )}
                    <h2 className="text-lg font-semibold text-gray-800">
                        {step === 1 ? 'Organization Details' : 'Administrator Assignment'}
                    </h2>
                </div>

                {errors.submit && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    {step === 1 && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="org-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Corporation"
                                    className={inputClass('name')}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <select
                                        id="org-industry"
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        className={inputClass('industry')}
                                    >
                                        <option value="">Select Industry</option>
                                        {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                                    <select
                                        id="org-company-size"
                                        name="companySize"
                                        value={form.companySize}
                                        onChange={handleChange}
                                        className={inputClass('companySize')}
                                    >
                                        <option value="">Select Size</option>
                                        {companySizes.map(s => <option key={s} value={s}>{s} employees</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        id="org-country"
                                        name="country"
                                        type="text"
                                        value={form.country}
                                        onChange={handleChange}
                                        placeholder="e.g. India"
                                        className={inputClass('country')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                    <select
                                        id="org-timezone"
                                        name="timezone"
                                        value={form.timezone}
                                        onChange={handleChange}
                                        className={inputClass('timezone')}
                                    >
                                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL <span className="text-xs text-gray-400">(optional)</span></label>
                                <input
                                    id="org-logo"
                                    name="logo"
                                    type="url"
                                    value={form.logo}
                                    onChange={handleChange}
                                    placeholder="https://example.com/logo.png"
                                    className={inputClass('logo')}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                                >
                                    Next: Assign Administrator →
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Summary of step 1 */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-700 font-bold text-lg">{form.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{form.name}</p>
                                        <p className="text-xs text-gray-500">{[form.industry, form.companySize && `${form.companySize} employees`, form.country].filter(Boolean).join(' · ')}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 bg-indigo-50 border border-indigo-100 rounded-md px-4 py-3">
                                <strong>Note:</strong> The assigned administrator will receive a secure activation email with instructions to set their password and complete the organization setup.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Administrator Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="admin-name"
                                    name="adminName"
                                    type="text"
                                    value={form.adminName}
                                    onChange={handleChange}
                                    placeholder="e.g. Jane Doe"
                                    className={inputClass('adminName')}
                                />
                                {errors.adminName && <p className="mt-1 text-xs text-red-600">{errors.adminName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Administrator Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="admin-email"
                                    name="adminEmail"
                                    type="email"
                                    value={form.adminEmail}
                                    onChange={handleChange}
                                    placeholder="e.g. jane.doe@acme.com"
                                    className={inputClass('adminEmail')}
                                />
                                {errors.adminEmail && <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Identifier <span className="text-xs text-gray-400">(optional)</span>
                                </label>
                                <input
                                    id="admin-identifier"
                                    name="adminIdentifier"
                                    type="text"
                                    value={form.adminIdentifier}
                                    onChange={handleChange}
                                    placeholder="e.g. EMP001 (internal reference)"
                                    className={inputClass('adminIdentifier')}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Creating Organization...
                                        </>
                                    ) : (
                                        '✓ Create Organization & Send Invitation'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
