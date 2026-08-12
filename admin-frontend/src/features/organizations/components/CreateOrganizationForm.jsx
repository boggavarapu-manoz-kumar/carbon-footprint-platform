import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, User as UserCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuperAdminOrganizationService from '../services/SuperAdminOrganizationService';
import { toast } from 'react-hot-toast';

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
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '', industry: '', companySize: '', country: '', timezone: 'UTC', logo: '',
        adminName: '', adminEmail: '', adminIdentifier: ''
    });
    const [errors, setErrors] = useState({});

    const createMutation = useMutation({
        mutationFn: (data) => SuperAdminOrganizationService.createOrganization(data),
        onSuccess: () => {
            toast.success("Organization created successfully");
            navigate('/organizations', { state: { success: true } });
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Failed to create organization. Please try again.';
            setErrors({ submit: msg });
            toast.error(msg);
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
        `block w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm ${
            errors[field] 
                ? 'border-red-400 bg-red-50/50 text-red-900 placeholder-red-300 focus:border-red-500' 
                : 'border-slate-200 bg-white/60 hover:bg-white/80 focus:bg-white focus:border-emerald-500'
        }`;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 flex justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Header */}
                <div className="mb-8 relative z-10">
                    <button
                        onClick={() => step === 2 ? setStep(1) : navigate('/organizations')}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        {step === 2 ? 'Back to Organization Details' : 'Back to Organizations'}
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Create Organization
                    </h1>
                    <p className="mt-2 text-base text-slate-600 max-w-xl">
                        Set up the corporate entity and invite the first administrator to manage their workspace.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center mb-10 relative z-10">
                    <motion.div 
                        initial={false}
                        animate={{ 
                            backgroundColor: step >= 1 ? '#059669' : 'transparent',
                            borderColor: step >= 1 ? '#059669' : '#cbd5e1',
                            color: step >= 1 ? '#ffffff' : '#64748b'
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold shadow-sm z-10 relative bg-white"
                    >
                        {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                    </motion.div>
                    
                    <div className="flex-1 h-1 mx-2 relative rounded-full overflow-hidden bg-slate-200">
                        <motion.div 
                            initial={false}
                            animate={{ width: step > 1 ? '100%' : '0%' }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute top-0 left-0 h-full bg-emerald-600"
                        />
                    </div>
                    
                    <motion.div 
                        initial={false}
                        animate={{ 
                            backgroundColor: step >= 2 ? '#059669' : '#ffffff',
                            borderColor: step >= 2 ? '#059669' : '#cbd5e1',
                            color: step >= 2 ? '#ffffff' : '#64748b'
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold shadow-sm z-10 relative transition-colors duration-500"
                    >
                        2
                    </motion.div>
                </div>

                {/* Form Card */}
                <div className="bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-2xl border border-white/50 overflow-hidden relative z-10">
                    
                    <AnimatePresence mode="wait">
                        <motion.form 
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onSubmit={handleSubmit} 
                            className="px-8 py-8 space-y-6"
                        >
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-600">
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">Organization Profile</h2>
                                            <p className="text-sm text-slate-500">Provide the basic details of the company.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Organization Name <span className="text-emerald-500">*</span>
                                        </label>
                                        <input
                                            name="name" type="text"
                                            value={form.name} onChange={handleChange}
                                            placeholder="e.g. Acme Corporation"
                                            className={inputClass('name')}
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Industry</label>
                                            <select name="industry" value={form.industry} onChange={handleChange} className={inputClass('industry')}>
                                                <option value="">Select Industry</option>
                                                {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Size</label>
                                            <select name="companySize" value={form.companySize} onChange={handleChange} className={inputClass('companySize')}>
                                                <option value="">Select Size</option>
                                                {companySizes.map(s => <option key={s} value={s}>{s} employees</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                                            <input name="country" type="text" value={form.country} onChange={handleChange} placeholder="e.g. India" className={inputClass('country')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Timezone</label>
                                            <select name="timezone" value={form.timezone} onChange={handleChange} className={inputClass('timezone')}>
                                                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full group bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                        >
                                            Proceed to Admin Setup
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-100/50 rounded-xl text-indigo-600">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">Assign Administrator</h2>
                                            <p className="text-sm text-slate-500">This person will receive an invite to manage {form.name}.</p>
                                        </div>
                                    </div>

                                    {/* Summary Card */}
                                    <motion.div 
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100/50 flex items-center gap-4 shadow-sm"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-emerald-200/50 flex items-center justify-center flex-shrink-0 text-emerald-800 font-black text-xl shadow-inner">
                                            {form.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{form.name}</p>
                                            <p className="text-sm text-slate-600 mt-0.5">{[form.industry, form.companySize && `${form.companySize} emp`, form.country].filter(Boolean).join(' • ')}</p>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-5 pt-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Administrator Full Name <span className="text-indigo-500">*</span>
                                            </label>
                                            <input name="adminName" type="text" value={form.adminName} onChange={handleChange} placeholder="e.g. Jane Doe" className={inputClass('adminName')} />
                                            {errors.adminName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.adminName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Administrator Email <span className="text-indigo-500">*</span>
                                            </label>
                                            <input name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} placeholder="e.g. jane.doe@acme.com" className={inputClass('adminEmail')} />
                                            {errors.adminEmail && <p className="mt-1 text-xs text-red-500 font-medium">{errors.adminEmail}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Employee Identifier <span className="text-xs text-slate-400 font-normal ml-1">(Optional)</span>
                                            </label>
                                            <input name="adminIdentifier" type="text" value={form.adminIdentifier} onChange={handleChange} placeholder="e.g. EMP-001" className={inputClass('adminIdentifier')} />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {createMutation.isPending ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                        </svg>
                                                        Provisioning Organization...
                                                    </>
                                                ) : (
                                                    'Create Organization & Send Invite'
                                                )}
                                            </span>
                                            {/* Hover effect overlay */}
                                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.form>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
