import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Building, User, Plus } from 'lucide-react';

const fetchMyOrganizations = async () => {
  const response = await api.get('/v1/organizations/my');
  return response.data;
};

const WorkspaceSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['myOrganizations'],
    queryFn: fetchMyOrganizations,
  });

  // Determine current context
  const isPersonal = !location.pathname.startsWith('/organization/');
  const currentOrgId = !isPersonal ? parseInt(location.pathname.split('/')[2], 10) : null;
  const currentOrg = organizations?.find(org => org.id === currentOrgId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWorkspace = (type, orgId = null) => {
    setIsOpen(false);
    if (type === 'personal') {
      navigate('/dashboard');
    } else if (type === 'organization') {
      navigate(`/organization/${orgId}`);
    }
  };

  const getDisplayName = () => {
    if (isPersonal) return t('workspace.personal', 'Personal Workspace');
    if (currentOrg) return currentOrg.name;
    return 'Organization Workspace';
  };

  const getIcon = () => {
    if (isPersonal) return <User className="w-5 h-5 text-indigo-500" />;
    return <Building className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
            {currentOrg?.logo ? (
              <img src={currentOrg.logo} alt={currentOrg.name} className="w-8 h-8 rounded object-cover" />
            ) : getIcon()}
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('workspace.label', 'Workspace')}</span>
            <span className="text-sm font-bold text-slate-900 truncate w-full text-left">{getDisplayName()}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            
            {/* Personal Workspace */}
            <button
              onClick={() => handleSelectWorkspace('personal')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${isPersonal ? 'bg-slate-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-500" />
                </div>
                <span className={`font-medium ${isPersonal ? 'text-slate-900' : 'text-slate-700'}`}>
                  {t('workspace.personal', 'Personal Workspace')}
                </span>
              </div>
              {isPersonal && <Check className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Organizations */}
            {organizations && organizations.length > 0 && (
              <>
                <div className="px-3 pt-3 pb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t('workspace.organizations', 'Organizations')}
                  </span>
                </div>
                {organizations.map(org => {
                  const isCurrent = currentOrgId === org.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSelectWorkspace('organization', org.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${isCurrent ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
                          {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-6 h-6 rounded object-cover" />
                          ) : (
                            <Building className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <span className={`font-medium truncate ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                          {org.name}
                        </span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </>
            )}
            
            {isLoading && (
              <div className="px-3 py-2 text-sm text-slate-500 flex justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
              </div>
            )}
            
            {/* Create Organization Button */}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                onClick={() => { setIsOpen(false); navigate('/organization/create'); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                {t('workspace.create_organization', 'Create Organization')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
